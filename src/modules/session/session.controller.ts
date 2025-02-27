import { Body, Controller, Delete, Get, Post, Put, Request, UploadedFile, UseGuards, UseInterceptors, UsePipes } from '@nestjs/common';
import { SessionService } from './session.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Request as RequestType } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileSizeValidationPipe } from 'src/shared/pipes/validate-file.pipe';
import { Authorization } from 'src/shared/decorators/authorization.decorator';
import { Authrorized } from 'src/shared/decorators/authrorized.decorator';
import { User } from '@prisma/client';
import { RemoveSessionDto } from './dto/remove-session.dto';
import { UpdateDto } from './dto/update.dto';

@Controller('session')
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

  @Post('logout')
  public async logout(@Request() req: RequestType) {
    return await this.sessionService.logout(req);
  }

  @Get('profile')
  @Authorization()
  public async findProfile(
    @Authrorized() user: User
  ) {
    return await this.sessionService.findProfile(user)
  }

  @Get()
  public async findAllSessions(@Request() req: RequestType) {
    return await this.sessionService.findAllSessions(req);
  }

  @Post('avatar')
  @Authorization()
  @UseInterceptors(FileInterceptor('avatar'))
  public async uploadAvatar(
    @Authrorized() user: User,
    @UploadedFile(new FileSizeValidationPipe()) avatar: Express.Multer.File
  ) {
    return await this.sessionService.uploadAvatar(user, avatar);
  }

  @Authorization()
  @Delete()
  public async removeSession(
    @Request() req: RequestType,
    @Body() dto: RemoveSessionDto
  ) {
    return await this.sessionService.removeSession(req, dto.id);
  }

  @Authorization()
  @Put()
  public async update(
    @Authrorized() user: User,
    @Body() dto: UpdateDto
  ) {
    return await this.sessionService.update(user, dto);
  }
}
