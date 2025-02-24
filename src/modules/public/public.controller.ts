import { Controller, Get, Param, Res } from '@nestjs/common';
import { PublicService } from './public.service';
import { Response } from 'express';

@Controller('public')
export class UploadsController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':dir/:file')
  public async findImage(
    @Param('dir') dir: string,
    @Param('file') file: string,
    @Res() res: Response
  ) {
    return await this.publicService.findImage(res, `${dir}/${file}`);
  }
}
