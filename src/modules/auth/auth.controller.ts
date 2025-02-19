import { Body, Controller, Param, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GetAuthorizationUrlDto } from './dto/get-authorization-url.dto';
import { AuthorizedDto } from './dto/authorized.dto';
import type { Request as RequestType } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("code")
  public async getAuthorizationCode(
    @Body() dto: GetAuthorizationUrlDto
  ) {
    return await this.authService.getAuthorizationCode(dto);
  }

  @Post("")
  public async authorized(
    @Body() dto: AuthorizedDto
  ) {
    return await this.authService.authorized(dto);
  } 

  @Post("refresh")
  public async refresh(
    @Request() req: RequestType
  ) {
    
  }
}
