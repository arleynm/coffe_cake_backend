import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MediaRepository } from '../../../domain/media/media.repository';
import { MediaEntity } from '../../../domain/media/media.entity';

@Injectable()
export class PrismaMediaRepository implements MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    filename: string;
    path: string;
    mimeType: string;
    sizeBytes: number;
  }): Promise<MediaEntity> {
    const row = await this.prisma.media.create({ data });
    return row as any;
  }

  async findById(id: string): Promise<MediaEntity | null> {
    const row = await this.prisma.media.findUnique({ where: { id } });
    return row as any;
  }
}