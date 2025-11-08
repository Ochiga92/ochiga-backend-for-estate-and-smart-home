// src/message/message.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { AwsIotService } from './aws-iot.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    AiModule, // ✅ Enables AI-powered message analysis and automation
  ],
  providers: [MessageService, AwsIotService],
  controllers: [MessageController],
  exports: [MessageService], // ✅ Allows other modules to use message functionalities
})
export class MessageModule {}
