import { Body, Controller, Post, Request, Response } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CodeDto } from './dto/code.dto';
import type { Response as ResponseType, Request as RequestType } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Post("login")
  public async login(
    @Body() dto: LoginDto,
    @Response() res: ResponseType,
    @Request() req: RequestType,
  ) {
    return await this.authService.login(dto, res, req);
  }

  @Post("token")
  public async exchangeCodeForTokens(
    @Body() dto: CodeDto
  ) {
    return await this.authService.exchangeCodeForTokens(dto.code);
  }
}
