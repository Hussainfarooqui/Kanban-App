import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 👤 Register
  @Post('register')
  async register(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('password') password: string,
  ) {
    return this.authService.register(email, name, password);
  }

  // 🔑 Login
  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }

  // 🔐 Get Current User
  @UseGuards(JwtAuthGuard) // 👈 ye token validate karega
  @Get('me')
  async me(@Req() req) {
    return req.user; // 👈 JwtStrategy se attach hoga
  }
}
