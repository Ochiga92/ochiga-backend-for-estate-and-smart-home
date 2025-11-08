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
import { AiAgent } from '../ai/ai.agent'; // 👈 integrated AI reasoning layer

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly aiAgent: AiAgent, // 👈 inject AI agent
  ) {}

  /** 🧠 AI-assisted login behavior analysis */
  async analyzeLoginActivity(logData: any) {
    const prompt = `Analyze the following login attempts for any suspicious behavior, anomalies, or possible breaches:
    ${JSON.stringify(logData, null, 2)}

    Respond with a brief summary and risk level (low, medium, high).`;

    return await this.aiAgent.queryExternalAgent(prompt, logData);
  }

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

    const token = this.generateJwt(user);

    // 🧠 Optional AI insight after registration
    await this.aiAgent.queryExternalAgent(
      `A new user just registered with email: ${user.email}. Analyze if the registration pattern seems normal or unusual.`,
      { user },
    );

    return {
      token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  /** Login an existing user */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const token = this.generateJwt(user);

    // 🧠 Run AI security check on login
    await this.analyzeLoginActivity({
      userId: user.id,
      email: user.email,
      timestamp: new Date().toISOString(),
      ip: loginDto.ipAddress || 'unknown',
    });

    return {
      token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  /** Generate access token */
  public generateJwt(user: User) {
    // include estate & house claims if available for easier RBAC downstream
    const payload: any = {
      sub: user.id,
      id: user.id,
      email: user.email,
      role: user.role,
    };

    if ((user as any).estate) payload.estate = (user as any).estate;
    if ((user as any).house) payload.house = (user as any).house;

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
      expiresIn: (process.env.JWT_ACCESS_EXPIRY as any) || '15m',
    });
  }

  /** Find user by id (used for refresh) */
  public async findById(id: string): Promise<User | null> {
    return this.userService.findById(id);
  }
}
