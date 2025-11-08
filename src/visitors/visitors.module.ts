// src/visitors/visitors.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VisitorsService } from './visitors.service';
import { VisitorsController } from './visitors.controller';
import { Visitor } from './entities/visitors.entity';
import { AiModule } from '../ai/ai.module'; // ✅ Add AI integration

@Module({
  imports: [
    TypeOrmModule.forFeature([Visitor]),
    AiModule, // ✅ Enables VisitorsService to use AiService
  ],
  providers: [VisitorsService],
  controllers: [VisitorsController],
  exports: [VisitorsService],
})
export class VisitorsModule {}
