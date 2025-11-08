// src/iot/iot.controller.ts
import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { IotService } from './iot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../enums/user-role.enum';
import { TokenUser } from '../auth/types/token-user.interface';
import { ControlDeviceDto } from './dto/control-device.dto';
import { CreateDeviceDto } from './dto/create-device.dto';

interface AuthenticatedRequest extends Request {
  user: TokenUser;
}

@Controller('iot')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IotController {
  constructor(private readonly iotService: IotService) {}

  @Get('my-devices')
  @Roles(UserRole.RESIDENT)
  getMyDevices(@Req() { user }: AuthenticatedRequest) {
    return this.iotService.findUserDevices(user.id);
  }

  @Get('estate-devices')
  @Roles(UserRole.MANAGER)
  getEstateDevices() {
    return this.iotService.findEstateDevices();
  }

  @Post('devices')
  @Roles(UserRole.RESIDENT, UserRole.MANAGER)
  createDevice(@Req() { user }: AuthenticatedRequest, @Body() dto: CreateDeviceDto) {
    return this.iotService.createDevice(user.id, user.role, dto);
  }

  @Post('devices/:id/control')
  @Roles(UserRole.RESIDENT, UserRole.MANAGER)
  controlDevice(
    @Req() { user }: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: ControlDeviceDto,
  ) {
    return this.iotService.controlDevice(user.id, user.role, id, dto);
  }

  @Get('devices/:id/logs')
  @Roles(UserRole.RESIDENT, UserRole.MANAGER)
  getDeviceLogs(@Req() { user }: AuthenticatedRequest, @Param('id') id: string) {
    return this.iotService.getDeviceLogs(user.id, user.role, id);
  }

  // 🧠 NEW: Smart AI analysis endpoint
  @Post('analyze')
  @Roles(UserRole.MANAGER, UserRole.RESIDENT)
  async analyzeIoT(@Body() sensorData: any) {
    const reasoning = await this.iotService.analyzeWithAI(sensorData);
    return { message: 'AI analyzed sensor data', reasoning };
  }
}
