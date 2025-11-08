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
} from '@nestjs/common';
import { EstateService } from './estate.service';
import { CreateEstateDto } from './dto/create-estate.dto';
import { UpdateEstateDto } from './dto/update-estate.dto';
import { Estate } from './entities/estate.entity';

@Controller('estates')
export class EstateController {
  constructor(private readonly estateService: EstateService) {}

  // ✅ Create a new estate
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEstateDto: CreateEstateDto): Promise<Estate> {
    return this.estateService.create(createEstateDto);
  }

  // ✅ Retrieve all estates
  @Get()
  async findAll(): Promise<Estate[]> {
    return this.estateService.findAll();
  }

  // ✅ Retrieve a single estate by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Estate> {
    return this.estateService.findOne(id);
  }

  // ✅ Update an estate by ID
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEstateDto: UpdateEstateDto,
  ): Promise<Estate> {
    return this.estateService.update(id, updateEstateDto);
  }

  // ✅ Delete an estate by ID (returns message + AI note)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id') id: string,
  ): Promise<{ message: string; note?: string }> {
    return this.estateService.remove(id);
  }
}
