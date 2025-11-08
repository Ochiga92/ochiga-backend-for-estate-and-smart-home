// src/estate/estate.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstateService } from './estate.service';
import { EstateController } from './estate.controller';
import { Estate } from './entities/estate.entity';
import { AiModule } from '../ai/ai.module'; // ✅ import AiAgent 

@Module({
  imports: [
    TypeOrmModule.forFeature([Estate]),
    AiModule, // ✅ import this so AiAgent or AiService can be injected
  ],
  controllers: [EstateController],
  providers: [EstateService],
  exports: [EstateService],
})
export class EstateModule {}
