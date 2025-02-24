import { Module } from '@nestjs/common';
import { PublicService } from './public.service';
import { UploadsController } from './public.controller';

@Module({
  controllers: [UploadsController],
  providers: [PublicService],
})
export class PublicModule {}
