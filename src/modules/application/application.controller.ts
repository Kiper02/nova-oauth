import { Body, Controller, Get, HttpStatus, Param, Post } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { Authorization } from 'src/shared/decorators/authorization.decorator';
import { Authrorized } from 'src/shared/decorators/authrorized.decorator';
import type { User } from '@prisma/client';
import { CreateScopeDto } from './dto/create-scope.dto';

@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Authorization()
  @Post()
  public async create(
    @Body() dto: CreateApplicationDto,
    @Authrorized() user: User
  ) {
    return await this.applicationService.create(user, dto)
  }


  @Authorization()
  @Get("scope")
  public async findScopes(
  ) {
    return await this.applicationService.findScopes();
  }


  @Authorization()
  @Get(":id")
  public async findById(@Param("id") id: string) {
    return await this.applicationService.findById(id);
  }

  @Authorization()
  @Get()
  public async findAll(
    @Authrorized() user: User
  ) {
    return await this.applicationService.findAll(user);
  }

  @Authorization()
  @Post("scope")
  public async createScope(
    @Body() dto: CreateScopeDto
  ) {
    return await this.applicationService.createScope(dto);
  }
}
