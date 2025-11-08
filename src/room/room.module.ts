import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Home } from '../home/entities/home.entity';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { AiModule } from '../ai/ai.module'; // ✅ AI module integration

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, Home]), // ✅ register entities
    AiModule, // ✅ enables RoomService to use AiService for insights or automation
  ],
  providers: [RoomService],
  controllers: [RoomController],
  exports: [RoomService],
})
export class RoomModule {}
