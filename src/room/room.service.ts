// src/room/room.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { Home } from '../home/entities/home.entity';
import { AiAgent } from '../ai/ai.agent';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepo: Repository<Room>,

    @InjectRepository(Home)
    private readonly homesRepo: Repository<Home>,

    private readonly aiAgent: AiAgent, // 🧠 AI Agent injected
  ) {}

  // Create a room within a home
  async createRoom(homeId: string, name: string) {
    const home = await this.homesRepo.findOne({ where: { id: homeId } });
    if (!home) throw new NotFoundException('Home not found');

    const room = this.roomsRepo.create({ name, home });
    return this.roomsRepo.save(room);
  }

  // Get all rooms for a specific home
  async findAllByHome(homeId: string) {
    return this.roomsRepo.find({
      where: { home: { id: homeId } },
      relations: ['home'],
    });
  }

  // 🧠 AI-enhanced feature: Recommend optimal room settings
  async recommendRoomSettings(roomState: any) {
    const prompt = `Recommend ideal room settings for comfort and efficiency based on the current state:
    ${JSON.stringify(roomState, null, 2)}`;

    return await this.aiAgent.queryExternalAgent(prompt, roomState);
  }

  // 🧠 AI-enhanced feature: Analyze energy or occupancy patterns
  async analyzeRoomUsage(roomData: any) {
    const prompt = `Analyze the following room usage data and suggest improvements or automation opportunities:
    ${JSON.stringify(roomData, null, 2)}`;

    return await this.aiAgent.queryExternalAgent(prompt, roomData);
  }
}
