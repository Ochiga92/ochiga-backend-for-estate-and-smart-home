// src/message/aws-iot.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as awsIot from 'aws-iot-device-sdk';

@Injectable()
export class AwsIotService implements OnModuleInit {
  private readonly logger = new Logger(AwsIotService.name);
  private device: awsIot.device | null = null;

  async onModuleInit() {
    try {
      this.logger.log('🌍 Initializing AWS IoT connection...');

      const certDir = path.resolve(__dirname, '../../certs');
      const certFiles = {
        keyPath: path.join(certDir, process.env.AWS_IOT_KEY ?? 'private.pem.key'),
        certPath: path.join(certDir, process.env.AWS_IOT_CERT ?? 'certificate.pem.crt'),
        caPath: path.join(certDir, process.env.AWS_IOT_CA ?? 'AmazonRootCA1.pem'),
      };

      // ✅ Check cert existence (prevents crash in Docker)
      for (const [name, filePath] of Object.entries(certFiles)) {
        if (!fs.existsSync(filePath)) {
          this.logger.warn(`⚠️ Missing ${name} at: ${filePath}`);
        }
      }

      const host = process.env.AWS_IOT_HOST ?? 'a3m9h28ikfvc7r-ats.iot.us-east-1.amazonaws.com';
      const clientId = process.env.AWS_IOT_CLIENT_ID ?? `OchigaBackend-${Math.floor(Math.random() * 10000)}`;

      this.device = new awsIot.device({
        ...certFiles,
        clientId,
        host,
        protocol: 'mqtts',
      });

      this.device.on('connect', () => {
        this.logger.log(`✅ Connected to AWS IoT Core as ${clientId}`);
        this.device!.subscribe('ochiga/messages');
      });

      this.device.on('message', (topic: string, payload: Buffer) => {
        this.logger.log(`📩 Received from ${topic}: ${payload.toString()}`);
      });

      this.device.on('error', (error: Error) => {
        this.logger.error(`❌ AWS IoT Error: ${error.message}`);
      });

      this.device.on('close', () => {
        this.logger.warn('🔌 AWS IoT connection closed. Retrying in 5s...');
        setTimeout(() => this.onModuleInit(), 5000);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : JSON.stringify(error);
      this.logger.error(`⚠️ AWS IoT initialization failed: ${message}`);
    }
  }

  async publishMessage(topic: string, payload: Record<string, any>): Promise<void> {
    if (!this.device) {
      this.logger.warn('AWS IoT device not connected yet.');
      return;
    }
    this.device.publish(topic, JSON.stringify(payload));
    this.logger.log(`📤 Published to ${topic}: ${JSON.stringify(payload)}`);
  }

  async publishTestMessage(): Promise<void> {
    const payload = {
      message: 'Hello from Ochiga Backend!',
      timestamp: new Date().toISOString(),
    };
    await this.publishMessage('ochiga/test/topic', payload);
  }
}
