// src/estate/estate.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estate } from './entities/estate.entity';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';

@Injectable()
export class EstateService {
  constructor(
    @InjectRepository(Estate)
    private readonly estateRepository: Repository<Estate>,
  ) {}

  async create(createEstateDto: CreateEstateDto): Promise<Estate> {
    const estate = this.estateRepository.create(createEstateDto);
    return await this.estateRepository.save(estate);
  }

  async findAll(skip = 0, take = 10): Promise<Estate[]> {
    return await this.estateRepository.find({
      skip,
      take,
      relations: ['homes'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Estate> {
    const estate = await this.estateRepository.findOne({
      where: { id },
      relations: ['homes'],
    });
    if (!estate) {
      throw new NotFoundException(`Estate with ID ${id} not found`);
    }
    return estate;
  }

  async update(id: string, updateEstateDto: UpdateEstateDto): Promise<Estate> {
    const estate = await this.findOne(id);
    Object.assign(estate, updateEstateDto);
    return await this.estateRepository.save(estate);
  }

  async remove(id: string): Promise<void> {
    const estate = await this.findOne(id);
    await this.estateRepository.softRemove(estate); // ✅ soft delete
  }
}
