import { BadRequestException } from '@nestjs/common';
export function imageFileFilter(_req: any, file: Express.Multer.File, cb: Function) {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new BadRequestException('Arquivo de imagem inválido'), false);
  }
  cb(null, true);
}
