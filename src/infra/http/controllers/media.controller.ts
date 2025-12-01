// src/interfaces/http/media.controller.ts
import { Controller, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { createWriteStream } from 'node:fs';
import { mkdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { UploadMediaUseCase } from '../../../application/use-cases/media/upload-media.usecase';

async function saveFromFastify(req: FastifyRequest) {
  const file = await (req as any).file?.(); // fornecido por @fastify/multipart
  if (!file) return null;

  // validação básica de mime (opcional, substitui seu imageFileFilter)
  if (!String(file.mimetype).startsWith('image/')) {
    throw new Error('Somente imagens são permitidas');
  }

  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  try { await stat(uploadsDir); } catch { await mkdir(uploadsDir, { recursive: true }); }

  const ext = extname(file.filename || '') || '.bin';
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const absPath = join(uploadsDir, unique);

  await pipeline(file.file, createWriteStream(absPath));
  const url = `/uploads/${unique}`;

  return {
    filename: file.filename,
    path: absPath,
    url,
    mimeType: file.mimetype,
    sizeBytes: file.file?.bytesRead ?? 0,
  };
}

@Controller('media')
export class MediaController {
  constructor(private readonly uploadMedia: UploadMediaUseCase) {}

  @Post('upload')
  async upload(@Req() req: FastifyRequest) {
    const saved = await saveFromFastify(req);
    if (!saved) {
      // compatível com o contrato anterior: lance erro ou retorne algo amigável
      throw new Error('Arquivo não enviado');
    }

    // seu use-case pode receber esses dados planos
    const out = await this.uploadMedia.exec({
      // adapte os campos conforme seu contrato do use-case:
      file: {
        path: saved.path,
        filename: saved.filename,
        mimetype: saved.mimeType,   // ✅ usa mimetype
        sizeBytes: saved.sizeBytes,
        publicUrl: saved.url,
      }
    });

    // se o use-case não persistir, ao menos devolvemos o payload salvo
    return out ?? {
      url: saved.url,
      path: saved.path,
      filename: saved.filename,
      mimeType: saved.mimeType,
      sizeBytes: saved.sizeBytes,
    };
  }
}
