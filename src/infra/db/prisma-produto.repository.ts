import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // ajuste o caminho
import { ProdutoRepository } from '../../domain/produto/produto.repository';
import { Produto } from '../../domain/produto/produto.entity';
import { Prisma } from '@prisma/client';

function mapToDomain(p: any): Produto {
  return new Produto(
    p.id,
    p.nome,
    p.categoriaId,
    p.descricao,
    p.precoCusto ? Number(p.precoCusto) : null,
    Number(p.precoVenda),
    p.ativo,
    p.exibirNoCardapio,
    p.imageId,
    p.imagemUrl,
    (p.tamanhos ?? []).map((t: any) => ({
      id: t.id,
      tamanho: t.tamanho,
      acrescimo: Number(t.acrescimo),
    })),
    (p.adicionais ?? []).map((a: any) => ({
      id: a.id,
      nome: a.nome,
      preco: Number(a.preco),
      ativo: a.ativo,
    })),
    (p.fichaTecnica ?? []).map((f: any) => ({
      id: f.id,
      insumoId: f.insumoId,
      insumoNome: f.insumo?.nome,
      unidade: f.insumo?.unidadeBase?.codigo,
      quantidade: Number(f.quantidade),
    })),
    p.createdAt,
    p.updatedAt,
  );
}

// include reutilizável para carregar o produto completo
const PRODUTO_INCLUDE = {
  tamanhos: true,
  adicionais: true,
  fichaTecnica: { include: { insumo: { include: { unidadeBase: true } } } },
} as const;

@Injectable()
export class PrismaProdutoRepository implements ProdutoRepository {
  constructor(private readonly prisma: PrismaService) {}

    async create(data: Omit<Produto, 'id'|'createdAt'|'updatedAt'>): Promise<Produto> {

        const cat = await this.prisma.categoriaCardapio.findUnique({
      where: { id: data.categoriaId },
      select: { id: true, nome: true, slug: true },
    });

    try {
      const created = await this.prisma.produto.create({
        include: PRODUTO_INCLUDE,
        data: {
          nome: data.nome,
          categoriaId: data.categoriaId, // precisa existir!
          descricao: data.descricao,
          precoCusto: data.precoCusto,
          precoVenda: data.precoVenda,
          ativo: data.ativo,
          exibirNoCardapio: data.exibirNoCardapio,
          imageId: data.imageId,
          imagemUrl: data.imagemUrl,
          tamanhos: data.tamanhos?.length
            ? { create: data.tamanhos.map(t => ({ tamanho: t.tamanho, acrescimo: t.acrescimo })) }
            : undefined,
          adicionais: data.adicionais?.length
            ? { create: data.adicionais.map(a => ({ nome: a.nome, preco: a.preco, ativo: a.ativo })) }
            : undefined,
          fichaTecnica: data.fichaTecnica?.length
            ? { create: data.fichaTecnica
                .filter(f => f.insumoId && Number(f.quantidade) > 0)
                .map(f => ({ insumoId: f.insumoId, quantidade: Number(f.quantidade) })) }
            : undefined,
        },
      });
      return mapToDomain(created);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new BadRequestException('categoriaId inválido: a categoria não existe.');
      }
      throw e;
    }
  }

  async update(id: string, patch: Partial<Omit<Produto, 'id'|'createdAt'|'updatedAt'>>): Promise<Produto> {
    // Para tamanhos/adicionais/fichaTecnica, fazemos upsert simples (apaga e recria):
    const { tamanhos, adicionais, fichaTecnica, ...rest } = patch;

    const updated = await this.prisma.produto.update({
      where: { id },
      data: {
        ...rest,
        // estratégia: apaga e recria (mais simples). Em produção, troque por upserts por item.
        ...(tamanhos
          ? {
              tamanhos: {
                deleteMany: { produtoId: id },
                create: tamanhos.map(t => ({ tamanho: t.tamanho, acrescimo: t.acrescimo })),
              },
            }
          : {}),
        ...(adicionais
          ? {
              adicionais: {
                deleteMany: { produtoId: id },
                create: adicionais.map(a => ({ nome: a.nome, preco: a.preco, ativo: a.ativo ?? true })),
              },
            }
          : {}),
        ...(fichaTecnica
          ? {
              fichaTecnica: {
                deleteMany: { produtoId: id },
                create: fichaTecnica
                  .filter(f => f.insumoId && Number(f.quantidade) > 0)
                  .map(f => ({ insumoId: f.insumoId, quantidade: Number(f.quantidade) })),
              },
            }
          : {}),
      },
      include: PRODUTO_INCLUDE,
    });

    return mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.produto.delete({ where: { id } });
  }

  async findById(id: string): Promise<Produto | null> {
    const p = await this.prisma.produto.findUnique({
      where: { id },
      include: PRODUTO_INCLUDE,
    });
    return p ? mapToDomain(p) : null;
  }

  async list(params: {
    q?: string;
    categoriaId?: string;
    ativo?: boolean;
    exibirNoCardapio?: boolean;
    page?: number;
    pageSize?: number;
    orderBy?: 'nome' | 'createdAt' | 'updatedAt' | 'precoVenda';
    orderDir?: 'asc' | 'desc';
  }) {
    const {
      q,
      categoriaId,
      ativo,
      exibirNoCardapio,
      orderBy = 'nome',
      orderDir = 'asc',
    } = params ?? {};

    // Coerção segura de paginação
    const pageNum = Number(params?.page ?? 1);
    const pageSizeNum = Number(params?.pageSize ?? 20);
    const hasValidPagination =
      Number.isFinite(pageNum) &&
      Number.isFinite(pageSizeNum) &&
      pageNum > 0 &&
      pageSizeNum > 0;

    const skip = hasValidPagination ? (pageNum - 1) * pageSizeNum : undefined;
    const take = hasValidPagination ? pageSizeNum : undefined;

    // Filtros
    const where: any = {
      ...(q
        ? {
            OR: [
              { nome: { contains: q, mode: 'insensitive' } },
              { descricao: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(categoriaId ? { categoriaId } : {}),
      ...(ativo !== undefined ? { ativo } : {}),
      ...(exibirNoCardapio !== undefined ? { exibirNoCardapio } : {}),
    };

    // OrderBy seguro
    const allowedOrderFields = new Set(['nome', 'createdAt', 'updatedAt', 'precoVenda']);
    const orderField = allowedOrderFields.has(orderBy) ? orderBy : 'nome';
    const dir = orderDir === 'desc' ? 'desc' : 'asc';

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.produto.findMany({
        where,
        include: PRODUTO_INCLUDE,
        orderBy: { [orderField]: dir },
        ...(hasValidPagination ? { skip, take } : {}), // 👈 só envia se válido
      }),
      this.prisma.produto.count({ where }),
    ]);

    return { items: rows.map(mapToDomain), total };
  }

}
