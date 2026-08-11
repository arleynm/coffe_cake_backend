import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infra/db/prisma.service';
import { CreateProdutoDto } from '../../../infra/http/dtos/create-produto.dto';
import { Prisma } from '@prisma/client';
import util from 'node:util';

@Injectable()
export class CreateProduto {
  constructor(private readonly prisma: PrismaService) {}

  async exec(dto: CreateProdutoDto) {
    console.log(
      '[CreateProduto.exec] dto =',
      util.inspect(dto, { depth: null, colors: true }),
    );
    console.log(
      '[CreateProduto.exec] DATABASE_URL =',
      process.env.DATABASE_URL,
    );

    if (!dto.categoriaId?.trim()) {
      throw new BadRequestException('categoriaId obrigatório');
    }

    const categoria = await this.prisma.categoriaCardapio.findUnique({
      where: { id: dto.categoriaId },
      select: { id: true, nome: true, slug: true },
    });

    console.log('[CreateProduto.exec] categoria encontrada =', categoria);

    if (!categoria) {
      throw new BadRequestException(
        'categoriaId inválido (categoria não encontrada)',
      );
    }

    const data: Prisma.ProdutoCreateInput = {
      nome: dto.nome,
      descricao: dto.descricao ?? null,
      precoCusto: dto.precoCusto as any,
      precoVenda: dto.precoVenda as any,
      ativo: dto.ativo ?? true,
      exibirNoCardapio: dto.exibirNoCardapio ?? true,
      imagemUrl: dto.imagemUrl ?? null,
      categoria: { connect: { id: dto.categoriaId } },
      tamanhos: dto.tamanhos?.length
        ? {
            create: dto.tamanhos.map((t) => ({
              tamanho: t.tamanho,
              acrescimo: t.acrescimo as any,
            })),
          }
        : undefined,
      adicionais: dto.adicionais?.length
        ? {
            create: dto.adicionais.map((a) => ({
              nome: a.nome,
              preco: a.preco as any,
              ativo: a.ativo ?? true,
            })),
          }
        : undefined,
      fichaTecnica: dto.fichaTecnica?.length
        ? {
            create: dto.fichaTecnica
              .filter((f) => f.insumoId && Number(f.quantidade) > 0)
              .map((f) => ({
                insumo: { connect: { id: f.insumoId } },
                quantidade: Number(f.quantidade),
              })),
          }
        : undefined,
    };

    console.log(
      '[CreateProduto.exec] prisma data =',
      util.inspect(data, { depth: null, colors: true }),
    );

    try {
      const created = await this.prisma.produto.create({
        data,
        include: {
          categoria: true,
          tamanhos: true,
          adicionais: true,
          fichaTecnica: { include: { insumo: { include: { unidadeBase: true } } } },
        },
      });

      console.log('[CreateProduto.exec] created =', {
        id: created.id,
        nome: created.nome,
      });

      return created;
    } catch (e: unknown) {
      console.error('[CreateProduto.exec] Prisma error:', e);

      const err = e as Prisma.PrismaClientKnownRequestError;

      if (err.code === 'P2025') {
        throw new BadRequestException(
          'categoriaId inválido (categoria não encontrada)',
        );
      }

      throw e;
    }
  }
}