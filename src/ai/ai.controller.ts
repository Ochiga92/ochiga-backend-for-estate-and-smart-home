import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('talk')
  async talk(@Body('input') input: string) {
    const reply = await this.aiService.processUserIntent(input);
    return { reply };
  }
}
