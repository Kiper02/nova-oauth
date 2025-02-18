import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { SessionService } from './session.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request as RequestType } from 'express';

@Controller('auth')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('register')
  public async register(@Body() dto: RegisterDto, @Request() req: RequestType) {
    return await this.sessionService.register(req, dto);
  }

  @Post('login')
  public async login(@Body() dto: LoginDto, @Request() req: RequestType) {
    return await this.sessionService.login(req, dto);
  }

  @Get('sessions')
  public async findAllSessions(@Request() req: RequestType) {
    return await this.sessionService.findAllSessions(req);
  }
}
