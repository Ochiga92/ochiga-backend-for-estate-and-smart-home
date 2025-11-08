import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { connect, MqttClient } from 'mqtt';
import { IotGateway } from './iot.gateway';

@Injectable()
export class IotMqttService {
  private client?: MqttClient;
  private readonly logger = new Logger(IotMqttService.name);

  constructor(private readonly gateway: IotGateway) {
    const endpoint = process.env.AWS_IOT_ENDPOINT;
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883';
    const certDir = path.resolve(process.cwd(), 'certs');

    // Use AWS IoT if certs exist, else fallback
    const hasCerts = fs.existsSync(path.join(certDir, 'private.pem.key'));
    const url = hasCerts ? `mqtts://${endpoint}:8883` : brokerUrl;

    const options = hasCerts
      ? {
          key: fs.readFileSync(path.join(certDir, 'private.pem.key')),
          cert: fs.readFileSync(path.join(certDir, 'certificate.pem.crt')),
          ca: fs.readFileSync(path.join(certDir, 'AmazonRootCA1.pem')),
          rejectUnauthorized: true,
          reconnectPeriod: 5000,
          clientId: `ochiga-${Math.floor(Math.random() * 10000)}`,
        }
      : { reconnectPeriod: 3000, clientId: `ochiga-local-${Math.random()}` };

    this.logger.log(`🚀 Connecting to MQTT broker: ${url}`);
    this.client = connect(url, options);

    this.client.on('connect', () => {
      this.logger.log('✅ Connected to MQTT broker');
      this.subscribeToTopics();
    });

    this.client.on('error', (err) => {
      this.logger.error(`❌ MQTT error: ${err.message}`);
    });

    this.client.on('message', (topic, payload) => {
      try {
        const message = JSON.parse(payload.toString());
        this.handleIncomingMessage(topic, message);
      } catch {
        this.logger.warn(`⚠️ Invalid JSON payload on ${topic}`);
      }
    });
  }

  private subscribeToTopics() {
    const topics = [
      'devices/+/status',
      'devices/+/telemetry',
      'devices/+/shadow/update',
      'devices/+/discovery',
    ];

    topics.forEach((topic) =>
      this.client?.subscribe(topic, (err) => {
        if (err) this.logger.error(`❌ Failed to subscribe: ${topic}`);
        else this.logger.log(`📡 Subscribed: ${topic}`);
      }),
    );
  }

  private handleIncomingMessage(topic: string, message: any) {
    this.logger.debug(`📥 MQTT ${topic}: ${JSON.stringify(message)}`);
    const match = topic.match(/^devices\/([^/]+)\/([^/]+)$/);
    if (!match) return;

    const [_, deviceId, eventType] = match;
    if (['status', 'telemetry'].includes(eventType))
      this.gateway.notifyDeviceUpdate({ deviceId, eventType, message });
    if (eventType === 'discovery')
      this.gateway.broadcast('deviceDiscovered', { deviceId, message });
  }

  publish(topic: string, message: any) {
    if (!this.client?.connected)
      return this.logger.warn(`⚠️ MQTT not connected (skip publish to ${topic})`);

    this.client.publish(topic, JSON.stringify(message), { qos: 1 });
    this.logger.verbose(`📤 Published ${topic}`);
  }

  publishToggle(deviceId: string, isOn: boolean) {
    this.publish(`devices/${deviceId}/toggle`, { isOn });
  }

  publishMetadata(deviceId: string, metadata: Record<string, any>) {
    this.publish(`devices/${deviceId}/metadata`, metadata);
  }

  publishDiscoveryRequest() {
    this.publish('devices/discover/request', { timestamp: new Date().toISOString() });
  }
}
