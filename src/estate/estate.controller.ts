// src/estate/estate.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { EstateService } from './estate.service';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { Estate } from './entities/estate.entity';

@ApiTags('Estates')
@Controller('estates')
export class EstateController {
  constructor(private readonly estateService: EstateService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Estate created successfully.' })
  async create(@Body() createEstateDto: CreateEstateDto): Promise<Estate> {
    return this.estateService.create(createEstateDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Get all estates.' })
  async findAll(
    @Query('skip') skip = 0,
    @Query('take') take = 10,
  ): Promise<Estate[]> {
    return this.estateService.findAll(Number(skip), Number(take));
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Get estate by ID.' })
  async findOne(@Param('id') id: string): Promise<Estate> {
    return this.estateService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Estate updated successfully.' })
  async update(
    @Param('id') id: string,
    @Body() updateEstateDto: UpdateEstateDto,
  ): Promise<Estate> {
    return this.estateService.update(id, updateEstateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: 204, description: 'Estate deleted successfully.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.estateService.remove(id);
  }
}
