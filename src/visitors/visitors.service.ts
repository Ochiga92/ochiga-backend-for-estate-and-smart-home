// src/visitors/visitors.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Visitor } from './entities/visitors.entity';
import { CreateVisitorDto } from './dto/create-visitor.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class VisitorsService {
  constructor(
    @InjectRepository(Visitor)
    private readonly visitorsRepo: Repository<Visitor>,
  ) {}

  /** Create new visitor invitation */
  async create(dto: CreateVisitorDto & { invitedById: string }) {
    const newVisitor = this.visitorsRepo.create({
      ...dto,
      code: uuid().slice(0, 8), // short unique code
      status: 'Pending',
    });

    return this.visitorsRepo.save(newVisitor);
  }

  /** Find all visitors */
  async findAll() {
    return this.visitorsRepo.find();
  }

  /** Find visitor by ID */
  async findOne(id: string) {
    const visitor = await this.visitorsRepo.findOne({ where: { id } });
    if (!visitor) throw new NotFoundException('Visitor not found');
    return visitor;
  }

  /** Update visitor status (Check-in / Check-out) */
  async updateStatus(id: string, status: string) {
    const visitor = await this.visitorsRepo.findOne({ where: { id } });
    if (!visitor) throw new NotFoundException('Visitor not found');

    visitor.status = status;
    return this.visitorsRepo.save(visitor);
  }

  /** Find visitor by entry code (e.g., scanned at gate) */
  async findByCode(code: string) {
    const visitor = await this.visitorsRepo.findOne({ where: { code } });
    if (!visitor) throw new NotFoundException('Visitor not found');
    return visitor;
  }
}
