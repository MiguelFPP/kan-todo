import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { RegisterDto, LoginDto, UserResponseDto } from '@kan-todo/types';
import { RegisterUserUseCase } from '../../core/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../../core/use-cases/auth/login-user.use-case';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase,
    private readonly jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.loginUseCase.execute(dto);
    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    response.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return { user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token');
    return { message: 'Logged out' };
  }
}
