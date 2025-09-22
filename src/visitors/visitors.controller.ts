// src/visitors/visitors.controller.ts
import { Controller, Post, Get, Param, Body, Req } from '@nestjs/common';
import { VisitorsService } from './visitors.service';
import { CreateVisitorDto } from './dto/create-visitor.dto';

@Controller('visitors')
export class VisitorsController {
  constructor(private readonly visitorsService: VisitorsService) {}

  /** Resident invites a visitor */
  @Post()
  async create(@Req() req, @Body() dto: CreateVisitorDto) {
    const user = (req as any).user; // AuthGuard injects user
    return this.visitorsService.create({ ...dto, invitedById: user.id });
  }

  /** List all visitors (admin/security use) */
  @Get()
  async findAll() {
    return this.visitorsService.findAll();
  }

  /** Get single visitor by ID */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.visitorsService.findOne(id);
  }

  /** Guard checks visitor in */
  @Post(':id/check-in')
  async checkIn(@Param('id') id: string) {
    return this.visitorsService.updateStatus(id, 'Checked In');
  }

  /** Guard checks visitor out */
  @Post(':id/check-out')
  async checkOut(@Param('id') id: string) {
    return this.visitorsService.updateStatus(id, 'Checked Out');
  }

  /** Find visitor by access code (e.g. scanning QR at gate) */
  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return this.visitorsService.findByCode(code);
  }
}
