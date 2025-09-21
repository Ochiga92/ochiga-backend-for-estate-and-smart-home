import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private rtRepo: Repository<RefreshToken>,
  ) {}

  /** Convert expiry string like "15m", "30d" into milliseconds */
  private parseExpiryMs(exp: string) {
    const num = parseInt(exp.slice(0, -1), 10);
    const unit = exp.slice(-1);
    switch (unit) {
      case 's': return num * 1000;
      case 'm': return num * 60 * 1000;
      case 'h': return num * 3600 * 1000;
      case 'd': return num * 24 * 3600 * 1000;
      default: return 30 * 24 * 3600 * 1000; // fallback: 30 days
    }
  }

  /** Generate and save a refresh token */
  async generateRefreshToken(userId: string, deviceInfo?: string) {
    const raw = crypto.randomBytes(64).toString('hex');
    const hash = await bcrypt.hash(raw, 10);

    const expiresIn = process.env.JWT_REFRESH_EXPIRY || '30d';
    const expiresAt = new Date(Date.now() + this.parseExpiryMs(expiresIn));

    const row = this.rtRepo.create({
      userId,
      tokenHash: hash,
      tokenHint: raw.slice(0, 10), // ⚡ optimization for lookup
      deviceInfo,
      expiresAt,
      revoked: false,
    });

    await this.rtRepo.save(row);
    return raw; // return raw token to client
  }

  /** Validate refresh token */
  async validateRefreshTokenByRaw(raw: string) {
    const candidates = await this.rtRepo.find({
      where: { revoked: false, tokenHint: raw.slice(0, 10) },
    });

    for (const r of candidates) {
      const ok = await bcrypt.compare(raw, r.tokenHash);
      if (ok && (!r.expiresAt || r.expiresAt > new Date())) {
        return r;
      }
    }
    return null;
  }

  /** Revoke a single refresh token */
  async revoke(rt: RefreshToken) {
    rt.revoked = true;
    await this.rtRepo.save(rt);
  }

  /** Revoke all refresh tokens for a user (logout all devices) */
  async revokeAllForUser(userId: string) {
    await this.rtRepo.update({ userId }, { revoked: true });
  }
}
