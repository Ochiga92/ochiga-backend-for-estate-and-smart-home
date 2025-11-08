import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'; // ✅ correct import
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { TokenService } from './token.service';
import { UserModule } from '../user/user.module';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }), // ✅ ensure registered
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: (process.env.JWT_ACCESS_EXPIRY as any) || '15m' },
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenService],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
