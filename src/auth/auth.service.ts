import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  /** Register a new user */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.userService.findByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashed = await bcrypt.hash(registerDto.password, 10);

    const user = await this.userService.create({
      ...registerDto,
      password: hashed,
    });

    const accessToken = this.generateJwt(user);

    return {
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  /** Login an existing user */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.generateJwt(user);

    return {
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  /** Generate access token */
  public generateJwt(user: User) {
  const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret not set');
  }

  return this.jwtService.sign(
    { id: user.id, email: user.email, role: user.role },
    {
      secret,
      expiresIn: process.env.JWT_ACCESS_EXPIRY ?? '15m',
    },
  );
}

  /** Find user by id (used for refresh) */
  public async findById(id: string): Promise<User | null> {
    return this.userService.findById(id);
  }
}
