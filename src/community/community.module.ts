// src/community/community.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { Post } from './entities/post.entity';
import { Group } from './entities/group.entity';
import { Comment } from './entities/comment.entity';
import { Message } from './entities/message.entity';
import { AiModule } from '../ai/ai.module'; // ✅ Added AI module

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Group, Comment, Message]),
    AiModule, // ✅ Enables AI insights and moderation features
  ],
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
