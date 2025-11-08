// src/home/home.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Home } from './entities/home.entity';
import { HomeMember } from './entities/home-member.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { User } from '../user/entities/user.entity';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { AiModule } from '../ai/ai.module'; // ✅ Import AI module so AiAgent is injectable

@Module({
  imports: [
    TypeOrmModule.forFeature([Home, HomeMember, Wallet, User]),
    AiModule, // ✅ enables AI assistant usage inside HomeService
  ],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
