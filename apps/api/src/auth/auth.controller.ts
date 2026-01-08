// apps/api/src/auth/auth.controller.ts
import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

// 定义个简单的 DTO (为了演示先不用 class-validator)
class AuthDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() signInDto: AuthDto) {
    return this.authService.login(signInDto.email, signInDto.password);
  }

  @Post('register')
  register(@Body() signUpDto: AuthDto) {
    return this.authService.register(signUpDto.email, signUpDto.password);
  }
}