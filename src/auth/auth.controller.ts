// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { TokenService } from './token.service';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  private cookieOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE as any) || 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
  };

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @Throttle('short') // ✅ max 5 login attempts per 60s
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const auth = await this.authService.login(loginDto);

    // ✅ issue refresh token
    const refresh = await this.tokenService.generateRefreshToken(
      auth.user.id,
      'web',
    );
    res.cookie('refreshToken', refresh, this.cookieOptions);

    return { accessToken: auth.accessToken, user: auth.user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.refreshToken;
    if (!raw) return res.status(401).json({ message: 'No refresh token' });

    const row = await this.tokenService.validateRefreshTokenByRaw(raw);
    if (!row) return res.status(401).json({ message: 'Invalid refresh token' });

    const user = await this.authService.findById(row.userId);
    if (!user) {
      await this.tokenService.revoke(row);
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: 'Invalid token' });
    }

    // ✅ always rotate refresh token
    await this.tokenService.revoke(row);
    const newRaw = await this.tokenService.generateRefreshToken(user.id, 'web');
    res.cookie('refreshToken', newRaw, this.cookieOptions);

    const accessToken = this.authService.generateJwt(user);
    return {
      accessToken,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  @ApiBearerAuth('access-token')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      const row = await this.tokenService.validateRefreshTokenByRaw(raw);
      if (row) await this.tokenService.revoke(row);
    }
    res.clearCookie('refreshToken');
    return { message: 'Logout successful' };
  }
}
