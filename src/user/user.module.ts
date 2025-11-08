import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Resident } from './entities/resident.entity';
import { ResidentController } from './resident.controller';
import { ResidentService } from './resident.service';
import { AiModule } from '../ai/ai.module'; // ✅ Import the AI module so AiAgent can be injected

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Resident]), // Database entities
    AiModule, // ✅ Add AiModule here to provide AiAgent
  ],
  controllers: [
    UserController,
    ResidentController,
  ],
  providers: [
    UserService,
    ResidentService,
  ],
  exports: [
    UserService,
    ResidentService,
  ],
})
export class UserModule {}
