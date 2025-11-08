// src/wallet/wallet.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { User } from '../user/entities/user.entity';
import { Transaction } from './entities/transaction.entity';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { AiModule } from '../ai/ai.module'; // ✅ AI integration

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet, User, Transaction]),
    AiModule, // ✅ enables WalletService to use AiService
  ],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
