// src/message/message.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { AiAgent } from '../ai/ai.agent';

@Injectable()
export class MessageService {
  constructor(
    private readonly aiAgent: AiAgent,
    @InjectRepository(Message)
    private readonly repo: Repository<Message>,
  ) {}

  /** 🔹 AI-powered auto response */
  async autoRespond(message: string) {
    const prompt = `Reply as a friendly Ochiga assistant to this message:
    "${message}"`;
    return await this.aiAgent.queryExternalAgent(prompt, {});
  }

  /** 🔹 Basic message CRUD */
  create(data: Partial<Message>) {
    return this.repo.save(data);
  }

  findConversation(senderId: number, receiverId: number) {
    return this.repo.find({
      where: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
      order: { createdAt: 'ASC' },
    });
  }
}
