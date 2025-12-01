import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CategoriaCardapioRepository } from '../../domain/cardapio/categoria.repository';
import { CategoriaCardapioEntity } from '../../domain/cardapio/categoria.entity';
import { Prisma } from '@prisma/client';

function map(p: any): CategoriaCardapioEntity {
  return new CategoriaCardapioEntity(
    p.id, p.nome, p.slug, p.ordem, p.ativo, p.createdAt, p.updatedAt,
  );
}

@Injectable()
export class PrismaCategoriaRepository implements CategoriaCardapioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<CategoriaCardapioEntity, 'id'|'createdAt'|'updatedAt'>): Promise<CategoriaCardapioEntity> {
    try {
      const created = await this.prisma.categoriaCardapio.create({ data });
      return map(created);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('Categoria com mesmo nome/slug já existe.');
      }
      throw e;
    }
  }

  async update(id: string, patch: Partial<Omit<CategoriaCardapioEntity, 'id'|'createdAt'|'updatedAt'>>): Promise<CategoriaCardapioEntity> {
    try {
      const updated = await this.prisma.categoriaCardapio.update({ where: { id }, data: patch });
      return map(updated);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('Categoria com mesmo nome/slug já existe.');
      }
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.categoriaCardapio.delete({ where: { id } });
  }

  async findById(id: string) {
    const c = await this.prisma.categoriaCardapio.findUnique({ where: { id } });
    return c ? map(c) : null;
  }

  async findBySlug(slug: string) {
    const c = await this.prisma.categoriaCardapio.findUnique({ where: { slug } });
    return c ? map(c) : null;
  }

 async list(params: {
    q?: string; ativo?: boolean; page?: number; pageSize?: number;
    orderBy?: 'nome'|'ordem'|'createdAt'|'updatedAt'; orderDir?: 'asc'|'desc';
    }) {
    const {
        q,
        ativo,
        orderBy = 'ordem',
        orderDir = 'asc',
    } = params ?? {};

    // paginação segura
    const pageNum = Number(params?.page ?? 1);
    const pageSizeNum = Number(params?.pageSize ?? 20);
    const hasValidPagination =
        Number.isFinite(pageNum) &&
        Number.isFinite(pageSizeNum) &&
        pageNum > 0 &&
        pageSizeNum > 0;

    const skip = hasValidPagination ? (pageNum - 1) * pageSizeNum : undefined;
    const take = hasValidPagination ? pageSizeNum : undefined;

    const where: any = {
        ...(q
        ? {
            OR: [
                { nome: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q, mode: 'insensitive' } },
            ],
            }
        : {}),
        ...(ativo !== undefined ? { ativo } : {}),
    };

    const allowed = new Set(['nome', 'ordem', 'createdAt', 'updatedAt']);
    const orderField = allowed.has(orderBy) ? orderBy : 'ordem';
    const dir = orderDir === 'desc' ? 'desc' : 'asc';

    const [rows, total] = await this.prisma.$transaction([
        this.prisma.categoriaCardapio.findMany({
        where,
        orderBy: { [orderField]: dir },
        ...(hasValidPagination ? { skip, take } : {}), // 👈 só envia se válido
        }),
        this.prisma.categoriaCardapio.count({ where }),
    ]);

    return { items: rows.map(map), total };
    }

}
