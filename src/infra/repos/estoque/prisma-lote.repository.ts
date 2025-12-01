import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { LoteRepository, ListLotesFilter } from '../../../domain/estoque/repositories/lote.repository';
import { Lote } from '../../../domain/estoque/entities/lote.entity';
import { Prisma } from '@prisma/client';
import { LoteMapper } from '../../mappers/lote.mapper';

@Injectable()
export class PrismaLoteRepository implements LoteRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { insumoId: string; depositoId: string; codigo?: string | null; validade?: Date | null }): Promise<Lote> {
    const created = await this.prisma.lote.create({ data: LoteMapper.toPrismaCreate(data) });
    return LoteMapper.toDomain(created);
  }

  async update(id: string, data: { codigo?: string | null; validade?: Date | null }): Promise<Lote> {
    const updated = await this.prisma.lote.update({ where: { id }, data: LoteMapper.toPrismaUpdate(data) });
    return LoteMapper.toDomain(updated);
  }

  async findById(id: string): Promise<Lote | null> {
    const l = await this.prisma.lote.findUnique({ where: { id } });
    return l ? LoteMapper.toDomain(l) : null;
  }

  async findMany(filter?: ListLotesFilter): Promise<Lote[]> {
    const where: Prisma.LoteWhereInput = {};
    if (filter?.insumoId) where.insumoId = filter.insumoId;
    if (filter?.depositoId) where.depositoId = filter.depositoId;
    if (filter?.vencendoAte) where.validade = { lte: filter.vencendoAte }; // nulls ficam de fora

    const list = await this.prisma.lote.findMany({
      where,
      orderBy: [{ validade: 'asc' }, { createdAt: 'desc' }],
    });
    return list.map(LoteMapper.toDomain);
  }
}
