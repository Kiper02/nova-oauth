import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
  private readonly maxSize = 1000 * 1024;

  transform(value: Express.Multer.File, metadata: ArgumentMetadata) {
    if (value.size > this.maxSize) {
      throw new BadRequestException('Файл слишком большой');
    }
    return value;
  }
}
