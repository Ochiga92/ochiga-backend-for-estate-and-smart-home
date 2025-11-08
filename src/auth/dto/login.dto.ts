import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(32, { message: 'Password must be at most 32 characters long' })
  password!: string;

  @IsOptional()
  @IsString()
  ipAddress?: string; // ✅ Added for AI login analysis and logging
}
