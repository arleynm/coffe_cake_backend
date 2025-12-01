// src/application/use-cases/media/upload-media.usecase.ts
import { Injectable } from '@nestjs/common';

export type UploadedImagePayload = {
  path: string;        // caminho absoluto no disco
  filename: string;    // nome original
  mimetype: string;    // ex.: "image/png"
  sizeBytes: number;   // tamanho em bytes
  publicUrl?: string;  // ex.: "/uploads/xyz.png"
};

export type UploadMediaInput = {
  file: UploadedImagePayload;
};

export type UploadMediaOutput = {
  id?: string;
  url: string;        // url pública final (use publicUrl, CDN ou o que salvar no banco)
  path: string;
  filename: string;
  mimetype: string;
  sizeBytes: number;
};

@Injectable()
export class UploadMediaUseCase {
  async exec(input: UploadMediaInput): Promise<UploadMediaOutput> {
    const { file } = input;

    // aqui você faz o que quiser: persistir em tabela Media, mover arquivo, etc.
    // vamos apenas devolver algo consistente:
    const url = file.publicUrl ?? `/uploads/${file.filename}`;

    return {
      id: undefined, // se você salvar no banco, retorne o id
      url,
      path: file.path,
      filename: file.filename,
      mimetype: file.mimetype,
      sizeBytes: file.sizeBytes,
    };
  }
}
