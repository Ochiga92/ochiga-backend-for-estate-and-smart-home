import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecret', // ✅ same key
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    // This becomes request.user
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
