import { Controller, Post, Body, HttpCode, HttpStatus, Res, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from './decorators/public.decorator';
import { TokenService } from './token.service';
import { Response, Request } from 'express';
import { UserService } from '../user/user.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    // ✅ Automatically include IP address for AI login tracking
    loginDto.ipAddress = req.ip;

    const auth = await this.authService.login(loginDto);
    const refresh = await this.tokenService.generateRefreshToken(auth.user.id, 'web');

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('refreshToken', refresh, {
      httpOnly: true,
      secure: isProd || process.env.COOKIE_SECURE === 'true',
      sameSite: isProd ? 'strict' : (process.env.COOKIE_SAME_SITE as any) || 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
    });

    return {
      success: true,
      message: 'Login successful',
      token: auth.token,
      user: auth.user,
    };
  }
}
