// src/message/aws-iot.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as awsIot from 'aws-iot-device-sdk';
import * as path from 'path';

@Injectable()
export class AwsIotService {
  private readonly logger = new Logger(AwsIotService.name);
  private device: awsIot.device;

  constructor() {
    this.device = awsIot.device({
      keyPath: path.resolve(__dirname, '../../certs/private.pem.key'),
      certPath: path.resolve(__dirname, '../../certs/certificate.pem.crt'),
      caPath: path.resolve(__dirname, '../../certs/AmazonRootCA1.pem'),
      clientId: 'OchigaBackendClient',
      host: 'a3m9h28ikfvc7r-ats.iot.us-east-1.amazonaws.com',
    });

    this.device.on('connect', () => {
      this.logger.log('✅ Connected to AWS IoT Core');
      this.device.subscribe('ochiga/test/topic');
    });

    this.device.on('message', (topic, payload) => {
      this.logger.log(`📩 Message from ${topic}: ${payload.toString()}`);
    });

    this.device.on('error', (error) => {
      this.logger.error(`❌ AWS IoT Error: ${error.message}`);
    });
  }

  async publishTestMessage(): Promise<void> {
    const payload = { message: 'Hello from Ochiga Backend!', timestamp: new Date().toISOString() };
    this.device.publish('ochiga/test/topic', JSON.stringify(payload));
    this.logger.log(`📤 Published: ${JSON.stringify(payload)}`);
  }
}
