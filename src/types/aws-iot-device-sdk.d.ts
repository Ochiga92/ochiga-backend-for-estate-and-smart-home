declare module 'aws-iot-device-sdk' {
  import { EventEmitter } from 'events';

  export interface DeviceOptions {
    keyPath: string;
    certPath: string;
    caPath: string;
    clientId: string;
    host: string;
    protocol?: string;
  }

  export class device extends EventEmitter {
    constructor(options: DeviceOptions);
    publish(topic: string, message: string): void;
    subscribe(topic: string): void;
    end(force?: boolean): void;
  }
}
