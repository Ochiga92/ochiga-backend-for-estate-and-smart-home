// src/visitors/dto/create-visitor.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateVisitorDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  purpose?: string;

  @IsOptional()
  @IsString()
  time?: string; // optional, e.g. "14:00"
}
