import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AssistantService } from './assistant.service';

interface CommandRequest {
  command: string;
}

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('command')
  async handleCommand(@Body() body: CommandRequest) {
    const command = body?.command?.trim();
    if (!command) {
      throw new HttpException('Command cannot be empty', HttpStatus.BAD_REQUEST);
    }

    try {
      const result = await this.assistantService.processCommand(command);
      return {
        success: true,
        message: 'Command executed successfully',
        data: result,
      };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: 'Assistant failed to process command',
          error: error?.message || 'Unknown error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('ping')
  ping() {
    return {
      success: true,
      message: 'Assistant module is active 🚀',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('command/:id')
  async getCommandById(@Param('id') id: string) {
    try {
      const result = await this.assistantService.getCommandById(id);
      if (!result) {
        throw new HttpException('Command not found', HttpStatus.NOT_FOUND);
      }
      return { success: true, data: result };
    } catch (error: any) {
      throw new HttpException(
        {
          success: false,
          message: `Failed to retrieve command with ID ${id}`,
          error: error?.message || 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
