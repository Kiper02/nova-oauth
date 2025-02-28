import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CodeDto } from './dto/code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post("login")
  public async login(
    @Body() dto: LoginDto
  ) {
    return await this.authService.login(dto);
  }

  @Post("token")
  public async exchangeCodeForTokens(
    @Body() dto: CodeDto
  ) {
    return await this.authService.exchangeCodeForTokens(dto.code);
  }
}
