import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PublicService {
  public async findImage(res: Response, file: string) {
    const __dirname = path.resolve();
    const name = path.join(__dirname, 'public', file);

    try {
      const imageBuffer = await fs.promises.readFile(name);
      res.set("Content-Type", "image/jpeg");
      res.set("Content-Disposition", `inline; filename="${file}"`); 
      return res.send(imageBuffer);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`Файл ${name} не найден`);
      } else {
        console.error(`Ошибка чтения файла ${name}: ${error}`);
      }
      return false;
    }
  }
}
