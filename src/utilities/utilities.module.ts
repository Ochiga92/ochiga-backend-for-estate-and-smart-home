// src/utilities/utilities.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilitiesController } from './utilities.controller';
import { UtilitiesService } from './utilities.service';
import { Bill } from './entities/bill.entity';
import { Maintenance } from './entities/maintenance.entity';
import { AiModule } from '../ai/ai.module'; // ✅ Added AI module

@Module({
  imports: [
    TypeOrmModule.forFeature([Bill, Maintenance]),
    AiModule, // ✅ Enables AI-powered insights and maintenance predictions
  ],
  controllers: [UtilitiesController],
  providers: [UtilitiesService],
  exports: [UtilitiesService],
})
export class UtilitiesModule {}
