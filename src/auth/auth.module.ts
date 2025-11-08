import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport'; // ✅ Correct spelling
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from '../user/user.module';
import { TokenService } from './token.service';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: (process.env.JWT_ACCESS_EXPIRY as any) || '15m' }, // ✅ Cast fixed
    }),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, TokenService],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
