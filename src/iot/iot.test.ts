import { IotGateway } from './iot.gateway';
import { IotMqttService } from './iot.mqtt';

const gateway = new IotGateway(); // or however it’s normally instantiated
const matt = new IotMqttService(gateway);
