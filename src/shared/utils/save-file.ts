import { v4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export default function saveFile(file: Express.Multer.File) {
  const __dirname = path.resolve();
  const ext = file.originalname.split('.').pop();

  if (!ext) {
    throw new Error('Файл не имеет расширения');
  }

  const name = `${v4()}.${ext}`;

  const dir = path.join(__dirname, 'public', 'images');

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, file.buffer);
  return path.join('public', 'images', name);
}
