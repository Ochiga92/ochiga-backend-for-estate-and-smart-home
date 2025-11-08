import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class IotGateway {
  @WebSocketServer() server!: Server;

  /** Broadcasts any event globally */
  broadcast(event: string, payload: any) {
    this.server?.emit(event, payload);
  }

  /** Estate-based room broadcasting (scalable) */
  toEstate(estateId: string, event: string, payload: any) {
    this.server?.to(`estate-${estateId}`).emit(event, payload);
  }

  notifyDeviceUpdate(device: any) {
    this.broadcast('deviceUpdate', device);
  }

  notifyLog(log: any) {
    this.broadcast('deviceLog', log);
  }
}
