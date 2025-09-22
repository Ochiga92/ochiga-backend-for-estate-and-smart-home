import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,

    @InjectRepository(EmailVerificationToken)
    private readonly emailVerificationRepo: Repository<EmailVerificationToken>,

    @InjectRepository(PasswordResetToken)
    private readonly resetRepo: Repository<PasswordResetToken>,
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

    // 👉 send verification mail
    await this.sendVerificationEmail(user);

    return {
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  /** Login an existing user */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      console.warn(
        `⚠️ Login failed → email=${loginDto.email}, reason=user_not_found`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(loginDto.password, user.password);
    if (!valid) {
      console.warn(
        `⚠️ Login failed → email=${loginDto.email}, reason=bad_password`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log(`✅ Login success → user=${user.email} role=${user.role}`);

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

  // -----------------------------
  // Email Verification
  // -----------------------------
  async sendVerificationEmail(user: User) {
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await this.emailVerificationRepo.save({
      userId: user.id,
      tokenHash,
      expiresAt: expires,
    });

    // TODO: Replace with real mailer service
    console.log(
      `👉 Verify email: ${process.env.APP_URL}/auth/verify-email?token=${token}`,
    );
  }

  async verifyEmail(token: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const row = await this.emailVerificationRepo.findOne({
      where: { tokenHash, used: false },
    });
    if (!row || row.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    row.used = true;
    await this.emailVerificationRepo.save(row);

    const user = await this.findById(row.userId);
    if (!user) throw new NotFoundException('User not found');

    user.isEmailVerified = true; // ⚡ ensure your User entity has this column
    await this.userService.update(user);

    return { message: 'Email verified successfully' };
  }

  // -----------------------------
  // Password Reset
  // -----------------------------
  async requestPasswordReset(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) return; // don’t leak info

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 mins
    await this.resetRepo.save({
      userId: user.id,
      tokenHash,
      expiresAt: expires,
    });

    // TODO: Replace with real mailer service
    console.log(
      `👉 Reset password: ${process.env.APP_URL}/auth/reset-password?token=${token}`,
    );
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const row = await this.resetRepo.findOne({
      where: { tokenHash, used: false },
    });
    if (!row || row.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const user = await this.findById(row.userId);
    if (!user) throw new NotFoundException('User not found');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userService.update(user);

    row.used = true;
    await this.resetRepo.save(row);

    return { message: 'Password reset successful' };
  }
}
