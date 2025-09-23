// src/iot/iot.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Device } from './entities/device.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class IotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    console.log(`🔌 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  // ✅ Broadcast updates to specific users or rooms
  notifyDeviceUpdate(device: Device) {
    if (device.owner) {
      this.server.to(device.owner.id).emit('deviceUpdated', device);
    }

    if (device.isEstateLevel) {
      this.server.to('managers').emit('estateDeviceUpdated', device);
    }
  }

  // ✅ Example: let clients join their user-room
  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ) {
    client.join(userId);
    client.emit('joinedRoom', { room: userId });
  }

  // ✅ Example: managers join estate-level room
  @SubscribeMessage('joinManagersRoom')
  handleJoinManagersRoom(@ConnectedSocket() client: Socket) {
    client.join('managers');
    client.emit('joinedRoom', { room: 'managers' });
  }
}
