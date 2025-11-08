// src/payments/payments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { AiModule } from '../ai/ai.module'; // ✅ Add AI module

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, Wallet]),
    AiModule, // ✅ Enables AI-powered analysis in PaymentsService
  ],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
