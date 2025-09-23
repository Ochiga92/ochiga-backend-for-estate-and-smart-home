// src/iot/iot.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { ControlDeviceDto } from './dto/control-device.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { Device } from './entities/device.entity';
import { DeviceLog } from './entities/device-log.entity';
import { IotGateway } from './iot.gateway';
import { User } from '../user/entities/user.entity'; // ✅ Import User

@Injectable()
export class IotService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,

    @InjectRepository(DeviceLog)
    private readonly logRepo: Repository<DeviceLog>,

    private readonly dataSource: DataSource,
    private readonly iotGateway: IotGateway,
  ) {}

  async findUserDevices(userId: string) {
    return this.deviceRepo.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
    });
  }

  async findEstateDevices() {
    return this.deviceRepo.find({
      where: { isEstateLevel: true },
    });
  }

  async createDevice(userId: string, role: UserRole, dto: CreateDeviceDto) {
    if (dto.isEstateLevel && role !== UserRole.MANAGER) {
      throw new ForbiddenException(
        'Only managers can create estate-level devices',
      );
    }

    let owner: User | null = null;
    if (!dto.isEstateLevel) {
      owner = await this.dataSource.getRepository(User).findOneBy({ id: userId });
      if (!owner) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
    }

    const device = this.deviceRepo.create({
      ...dto,
      owner,
      metadata: dto?.['metadata']
        ? JSON.stringify(dto['metadata'])
        : null,
    });

    const saved = await this.deviceRepo.save(device);

    this.iotGateway.notifyDeviceUpdate(saved);

    return saved;
  }

  async controlDevice(
    userId: string,
    role: UserRole,
    deviceId: string,
    dto: ControlDeviceDto,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const device = await manager.findOne(Device, {
        where: { id: deviceId },
        relations: ['owner'],
      });

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      if (device.isEstateLevel && role !== UserRole.MANAGER) {
        throw new ForbiddenException(
          'Only managers can control estate-level devices',
        );
      }
      if (!device.isEstateLevel && (!device.owner || device.owner.id !== userId)) {
        throw new ForbiddenException('You can only control your own devices');
      }

      // ✅ Apply control
      if (dto.action === 'on') device.isOn = true;
      if (dto.action === 'off') device.isOn = false;
      if (dto.action === 'set-temp') {
        const metadata = device.metadata ? JSON.parse(device.metadata) : {};
        metadata.temp = dto.value;
        device.metadata = JSON.stringify(metadata);
      }

      await manager.save(Device, device);

      // ✅ Log action
      const log = manager.create(DeviceLog, {
        device: { id: device.id } as Device,
        action: dto.action,
        details:
          dto.value !== undefined ? JSON.stringify(dto.value) : undefined,
      });
      await manager.save(DeviceLog, log);

      // ✅ Real-time notification
      this.iotGateway.notifyDeviceUpdate(device);

      return {
        id: device.id,
        name: device.name,
        isOn: device.isOn,
        metadata: device.metadata ? JSON.parse(device.metadata) : {},
      };
    });
  }

  async getDeviceLogs(userId: string, role: UserRole, deviceId: string) {
    const device = await this.deviceRepo.findOne({
      where: { id: deviceId },
      relations: ['owner'],
    });

    if (!device) throw new NotFoundException('Device not found');

    if (device.isEstateLevel && role !== UserRole.MANAGER) {
      throw new ForbiddenException(
        'Only managers can view estate-level device logs',
      );
    }
    if (!device.isEstateLevel && (!device.owner || device.owner.id !== userId)) {
      throw new ForbiddenException('You can only view your own device logs');
    }

    return this.logRepo.find({
      where: { device: { id: deviceId } },
      order: { createdAt: 'DESC' },
    });
  }
}
