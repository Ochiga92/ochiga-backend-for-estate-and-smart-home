import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiAgent } from './ai.agent';

@Module({
  imports: [HttpModule],
  providers: [AiAgent],
  exports: [AiAgent], // 👈 make AiAgent available to other modules
})
export class AiModule {}
