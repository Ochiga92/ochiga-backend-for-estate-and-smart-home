// src/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';

@Module({
  controllers: [DashboardController],
})
export class DashboardModule {}
