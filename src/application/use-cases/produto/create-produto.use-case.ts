// application/use-cases/produto/create-produto.use-case.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infra/db/prisma.service';
import { CreateProdutoDto } from '../../../infra/http/dtos/create-produto.dto';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import util from 'node:util';

@Injectable()
export class CreateProduto {
  constructor(private readonly prisma: PrismaService) {}

  async exec(dto: CreateProdutoDto) {
    // 🔎 DTO que chegou do controller
    console.log('[CreateProduto.exec] dto =', util.inspect(dto, { depth: null, colors: true }));
    console.log('[CreateProduto.exec] DATABASE_URL =', process.env.DATABASE_URL);

    if (!dto.categoriaId?.trim()) {
      throw new BadRequestException('categoriaId obrigatório');
    }

    // 🔎 Confere se a categoria existe MESMA base
    const categoria = await this.prisma.categoriaCardapio.findUnique({
      where: { id: dto.categoriaId },
      select: { id: true, nome: true, slug: true },
    });
    console.log('[CreateProduto.exec] categoria encontrada =', categoria);

    if (!categoria) {
      throw new BadRequestException('categoriaId inválido (categoria não encontrada)');
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
        ? { create: dto.tamanhos.map(t => ({ tamanho: t.tamanho, acrescimo: t.acrescimo as any })) }
        : undefined,
      adicionais: dto.adicionais?.length
        ? { create: dto.adicionais.map(a => ({ nome: a.nome, preco: a.preco as any, ativo: a.ativo ?? true })) }
        : undefined,
    };

    // 🔎 O que exatamente vai para o Prisma
    console.log('[CreateProduto.exec] prisma data =', util.inspect(data, { depth: null, colors: true }));

    try {
      const created = await this.prisma.produto.create({
        data,
        include: { categoria: true, tamanhos: true, adicionais: true },
      });
      console.log('[CreateProduto.exec] created =', { id: created.id, nome: created.nome });
      return created;
    } catch (e: any) {
      console.error('[CreateProduto.exec] Prisma error:', e);
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new BadRequestException('categoriaId inválido (categoria não encontrada)');
      }
      throw e;
    }
  }
}
