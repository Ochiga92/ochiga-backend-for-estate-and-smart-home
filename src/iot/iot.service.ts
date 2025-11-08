import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../enums/user-role.enum';
import { ControlDeviceDto } from './dto/control-device.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { Device } from './entities/device.entity';
import { DeviceLog } from './entities/device-log.entity';
import { IotGateway } from './iot.gateway';
import { IotMqttService } from './iot.mqtt';
import { AiAgent } from '../ai/ai.agent';

@Injectable()
export class IotService {
  private readonly logger = new Logger(IotService.name);

  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,

    @InjectRepository(DeviceLog)
    private readonly logRepo: Repository<DeviceLog>,

    private readonly gateway: IotGateway,
    private readonly mqtt: IotMqttService,

    // 🧠 Smart AI reasoning agent for IoT insights
    private readonly aiAgent: AiAgent,
  ) {}

  // ✅ Find all devices belonging to a user
  async findUserDevices(userId: string) {
    return this.deviceRepo.find({
      where: { owner: { id: userId } },
      relations: ['owner'],
    });
  }

  // ✅ Find all estate-level devices (for manager view)
  async findEstateDevices() {
    return this.deviceRepo.find({ where: { isEstateLevel: true } });
  }

  // ✅ Create a new device with AI post-validation
  async createDevice(userId: string, role: UserRole, dto: CreateDeviceDto) {
    if (dto.isEstateLevel && role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only managers can create estate-level devices');
    }

    const device = this.deviceRepo.create({
      ...dto,
      owner: dto.isEstateLevel ? null : ({ id: userId } as any),
      isOn: false,
      metadata: {},
    });

    const saved = await this.deviceRepo.save(device);

    // 🔔 Notify connected clients and sync MQTT
    this.gateway.broadcast('deviceCreated', saved);
    this.mqtt.publishToggle(saved.id.toString(), saved.isOn);

    // 🧠 AI Insight: Device Registration
    const aiNote = await this.aiAgent.queryExternalAgent(
      `A new IoT device has been registered. 
      Analyze the device type and suggest best automation routines or efficiency tips.`,
      saved,
    );

    return { ...saved, aiNote };
  }

  // ✅ Control a specific device (with validation and AI log context)
  async controlDevice(userId: string, role: UserRole, deviceId: string, dto: ControlDeviceDto) {
    const device = await this.deviceRepo.findOne({
      where: { id: deviceId as any },
      relations: ['owner'],
    });
    if (!device) throw new NotFoundException('Device not found');

    // 🔐 Role-based control
    if (device.isEstateLevel && role !== UserRole.MANAGER)
      throw new ForbiddenException('Only managers can control estate-level devices');
    if (!device.isEstateLevel && (!device.owner || device.owner.id !== userId))
      throw new ForbiddenException('You can only control your own devices');

    // 🧩 Update metadata dynamically
    const metadata: Record<string, any> = device.metadata || {};
    switch (dto.action) {
      case 'on':
        device.isOn = true;
        break;
      case 'off':
        device.isOn = false;
        break;
      case 'set-temp':
        metadata.temp = dto.value;
        break;
      case 'set-brightness':
        metadata.brightness = dto.value;
        break;
      case 'set-speed':
        metadata.speed = dto.value;
        break;
      case 'set-mode':
        metadata.mode = dto.mode ?? dto.value;
        break;
      case 'custom':
        Object.assign(metadata, dto.payload);
        break;
      default:
        throw new BadRequestException(`Unsupported action: ${dto.action}`);
    }

    device.metadata = metadata;
    await this.deviceRepo.save(device);

    // 🧾 Log the control event
    await this.logRepo.save(
      this.logRepo.create({
        device,
        action: dto.action,
        details: {
          value: dto.value,
          payload: dto.payload,
          timestamp: new Date().toISOString(),
        },
      }),
    );

    // 🔊 Realtime broadcast & MQTT sync
    const payload = { id: device.id, name: device.name, isOn: device.isOn, metadata };
    this.gateway.broadcast('deviceUpdated', payload);
    this.mqtt.publishToggle(device.id.toString(), device.isOn);
    this.mqtt.publishMetadata(device.id.toString(), metadata);

    // 🧠 AI Insight: Device Control Analysis
    const aiInsight = await this.aiAgent.queryExternalAgent(
      `Analyze this IoT control action:
      - Device: ${device.name}
      - Action: ${dto.action}
      - Metadata: ${JSON.stringify(metadata)}
      Provide a short reasoning on potential energy impact or efficiency improvement.`,
      payload,
    );

    return { ...payload, aiInsight };
  }

  // ✅ Get device logs (with permission check)
  async getDeviceLogs(userId: string, role: UserRole, deviceId: string) {
    const device = await this.deviceRepo.findOne({
      where: { id: deviceId as any },
      relations: ['owner'],
    });
    if (!device) throw new NotFoundException('Device not found');
    if (device.isEstateLevel && role !== UserRole.MANAGER)
      throw new ForbiddenException('Only managers can view estate-level device logs');
    if (!device.isEstateLevel && (!device.owner || device.owner.id !== userId))
      throw new ForbiddenException('You can only view your own device logs');

    const logs = await this.logRepo.find({
      where: { device: { id: deviceId } },
      order: { createdAt: 'DESC' },
    });

    // 🧠 Optional: AI-assisted log summary
    const aiSummary = await this.aiAgent.queryExternalAgent(
      `Summarize the recent IoT logs for the device "${device.name}".
      Identify any anomalies, repeated errors, or maintenance recommendations.`,
      logs,
    );

    return { logs, aiSummary };
  }

  // ✅ Toggle device by name (for AI assistant)
  async toggleDeviceByName(name: string) {
    const device = await this.deviceRepo.findOne({ where: { name } });
    if (!device) throw new NotFoundException(`Device "${name}" not found`);

    device.isOn = !device.isOn;
    await this.deviceRepo.save(device);

    // 🔊 Broadcast changes and MQTT publish
    this.gateway.broadcast('deviceUpdated', device);
    this.mqtt.publishToggle(device.id.toString(), device.isOn);

    return { message: `Device ${device.name} turned ${device.isOn ? 'on' : 'off'}` };
  }

  // 🧠 ---------------- AI-Driven Automation & Analytics ---------------- //

  /** 
   * 🔹 Analyze raw IoT sensor data and recommend best control action
   * Used for automation routines or predictive response
   */
  async analyzeWithAI(sensorData: any) {
    const prompt = `
      You are Ochiga Smart Infrastructure AI.
      Analyze this IoT sensor data (temperature, humidity, energy, motion, etc.).
      Detect anomalies, energy inefficiencies, and suggest the optimal control response.
      Data:
      ${JSON.stringify(sensorData, null, 2)}
    `;

    const aiResponse = await this.aiAgent.queryExternalAgent(prompt, sensorData);
    this.logger.log(`🤖 AI IoT Analysis: ${aiResponse}`);
    return aiResponse;
  }

  /**
   * 🔹 Predictive Maintenance & Failure Risk Estimation
   */
  async predictDeviceHealth(deviceData: any) {
    const prompt = `
      You are an AI maintenance analyst for smart devices.
      Analyze the following IoT device data and predict:
      - Potential failure points
      - Maintenance urgency
      - Recommended service schedule
      - Estimated lifespan extension if optimized

      ${JSON.stringify(deviceData, null, 2)}
    `;

    const aiPrediction = await this.aiAgent.queryExternalAgent(prompt, deviceData);
    return { prediction: aiPrediction };
  }

  /**
   * 🔹 Estate-wide IoT Performance Summary
   */
  async summarizeAllDevices() {
    const devices = await this.deviceRepo.find();
    const prompt = `
      Summarize the overall IoT device network performance for the estate.
      Include:
      - Total devices
      - Active vs inactive ratio
      - Energy efficiency overview
      - Faulty or offline devices
      - Recommendations for optimization and automation upgrades

      ${JSON.stringify(devices, null, 2)}
    `;

    const aiSummary = await this.aiAgent.queryExternalAgent(prompt, devices);
    return { totalDevices: devices.length, aiSummary };
  }
}
