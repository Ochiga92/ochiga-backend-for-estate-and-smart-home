// src/iot/iot.mqtt.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { connect, MqttClient } from 'mqtt';
import { IotGateway } from './iot.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './entities/device.entity';

@Injectable()
export class IotMqttService implements OnModuleInit {
  private client!: MqttClient;
  private readonly logger = new Logger(IotMqttService.name);

  constructor(
    private readonly gateway: IotGateway,
    @InjectRepository(Device) private readonly deviceRepo: Repository<Device>,
  ) {}

  onModuleInit() {
    this.client = connect('mqtt://broker.hivemq.com:1883'); // or your broker
    this.client.on('connect', () => {
      this.logger.log('✅ Connected to MQTT broker');
      this.client.subscribe('estate/devices/+/status');
    });

    this.client.on('message', async (topic, payload) => {
      try {
        const data = JSON.parse(payload.toString());
        const deviceId = topic.split('/')[2]; // estate/devices/:id/status

        const device = await this.deviceRepo.findOne({ where: { id: deviceId } });
        if (device) {
          device.isOn = data.status;
          await this.deviceRepo.save(device);
          this.gateway.notifyDeviceUpdate(device);
        }
      } catch (err) {
        this.logger.error('MQTT parse error', err);
      }
    });
  }

  publishToggle(deviceId: string, status: boolean) {
    this.client.publish(
      `estate/devices/${deviceId}/toggle`,
      JSON.stringify({ status }),
    );
  }
}
