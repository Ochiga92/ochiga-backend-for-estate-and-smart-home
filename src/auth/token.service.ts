import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ObjectLiteral } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private rtRepo: Repository<RefreshToken>,

    @InjectRepository(EmailVerificationToken)
    private evRepo: Repository<EmailVerificationToken>,

    @InjectRepository(PasswordResetToken)
    private prRepo: Repository<PasswordResetToken>,
  ) {}

  private parseExpiryMs(exp: string) {
    const num = parseInt(exp.slice(0, -1), 10);
    const unit = exp.slice(-1);
    switch (unit) {
      case 's': return num * 1000;
      case 'm': return num * 60 * 1000;
      case 'h': return num * 3600 * 1000;
      case 'd': return num * 24 * 3600 * 1000;
      default: return 30 * 24 * 3600 * 1000;
    }
  }

  private async generateToken<T extends ObjectLiteral>(
    repo: Repository<T>,
    userId: string,
    expiry: string,
    extras: Partial<T> = {},
  ) {
    const raw = crypto.randomBytes(64).toString('hex');
    const hash = await bcrypt.hash(raw, 10);
    const expiresAt = new Date(Date.now() + this.parseExpiryMs(expiry));

    const row = repo.create({
      userId,
      tokenHash: hash,
      expiresAt,
      ...extras,
    } as any);
    await repo.save(row);
    return raw;
  }

  private async validateToken<T extends ObjectLiteral>(
    repo: Repository<T>,
    raw: string,
    extraWhere: any = {},
  ): Promise<T | null> {
    const rows = await repo.find({ where: extraWhere });
    for (const r of rows as any[]) {
      const ok = await bcrypt.compare(raw, r.tokenHash);
      if (ok && (!r.expiresAt || r.expiresAt > new Date())) return r as T;
    }
    return null;
  }

  /** 🔄 Refresh Tokens */
  async generateRefreshToken(userId: string, deviceInfo?: string) {
    return this.generateToken(
      this.rtRepo,
      userId,
      process.env.JWT_REFRESH_EXPIRY || '30d',
      { revoked: false, deviceInfo } as any,
    );
  }

  async validateRefreshTokenByRaw(raw: string) {
    return this.validateToken(this.rtRepo, raw, { revoked: false });
  }

  async revoke(rt: RefreshToken) {
    rt.revoked = true;
    await this.rtRepo.save(rt);
  }

  /** 📧 Email Verification Tokens */
  async generateEmailVerificationToken(userId: string) {
    return this.generateToken(
      this.evRepo,
      userId,
      process.env.EMAIL_VERIFICATION_EXPIRY || '1d',
      { used: false } as any,
    );
  }

  async validateEmailVerificationToken(raw: string) {
    return this.validateToken(this.evRepo, raw, { used: false });
  }

  async markEmailVerificationUsed(token: EmailVerificationToken) {
    token.used = true;
    await this.evRepo.save(token);
  }

  /** 🔑 Password Reset Tokens */
  async generatePasswordResetToken(userId: string) {
    return this.generateToken(
      this.prRepo,
      userId,
      process.env.PASSWORD_RESET_EXPIRY || '1h',
      { used: false } as any,
    );
  }

  async validatePasswordResetToken(raw: string) {
    return this.validateToken(this.prRepo, raw, { used: false });
  }

  async markPasswordResetUsed(token: PasswordResetToken) {
    token.used = true;
    await this.prRepo.save(token);
  }
}
