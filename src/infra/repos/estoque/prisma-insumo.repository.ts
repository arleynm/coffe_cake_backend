import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { InsumoRepository, ListInsumosFilter } from '../../../domain/estoque/repositories/insumo.repository';
import { Insumo } from '../../../domain/estoque/entities/insumo.entity';
import { Prisma } from '@prisma/client';
import { InsumoMapper } from '../../mappers/insumo.mapper';

@Injectable()
export class PrismaInsumoRepository implements InsumoRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    nome: string;
    unidadeBaseId: string;
    sku?: string | null;
    estoqueMinimo?: number | null;
    ativo?: boolean;
  }): Promise<Insumo> {
    const created = await this.prisma.insumo.create({
      data: InsumoMapper.toPrismaCreate(data),
    });
    return InsumoMapper.toDomain(created);
  }

  async update(id: string, data: Partial<Omit<Insumo, 'id'>>): Promise<Insumo> {
    const updated = await this.prisma.insumo.update({
      where: { id },
      data: InsumoMapper.toPrismaUpdate(data),
    });
    return InsumoMapper.toDomain(updated);
  }

  async toggleActive(id: string, ativo: boolean): Promise<Insumo> {
    const updated = await this.prisma.insumo.update({ where: { id }, data: { ativo } });
    return InsumoMapper.toDomain(updated);
  }

  async findAll(filter?: ListInsumosFilter): Promise<Insumo[]> {
    const where: Prisma.InsumoWhereInput = {};
    if (filter?.onlyActive === true) where.ativo = true;

    if (filter?.search) {
      const s = filter.search.trim();
      where.OR = [
        { nome: { contains: s } }, 
        { sku:  { contains: s } }, 
      ];
    }

    const list = await this.prisma.insumo.findMany({
      where,
      orderBy: [{ nome: 'asc' }],
    });
    return list.map(InsumoMapper.toDomain);
  }


  async findById(id: string): Promise<Insumo | null> {
    const i = await this.prisma.insumo.findUnique({ where: { id } });
    return i ? InsumoMapper.toDomain(i) : null;
  }

  async findBySku(sku: string): Promise<Insumo | null> {
    const i = await this.prisma.insumo.findUnique({ where: { sku } });
    return i ? InsumoMapper.toDomain(i) : null;
  }
}
