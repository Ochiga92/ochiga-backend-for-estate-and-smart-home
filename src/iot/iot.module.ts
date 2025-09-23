// src/iot/iot.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IotController } from './iot.controller';
import { IotService } from './iot.service';
import { Device } from './entities/device.entity';
import { DeviceLog } from './entities/device-log.entity';
import { IotGateway } from './iot.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Device, DeviceLog])],
  controllers: [IotController],
  providers: [IotService, IotGateway],
  exports: [IotService], // ✅ Only service is exported for use in other modules
})
export class IotModule {}
