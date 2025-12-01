// src/infra/mappers/pedido.prisma.mapper.ts
import type { Prisma } from '@prisma/client';
import { Pedido, PedidoItem, PedidoItemAdicional } from '../../domain/pedido/pedido.entity';

export const PedidoPrismaMapper = {
  toDomain(raw: any): Pedido {
    return new Pedido(
      raw.id,
      raw.numero,
      raw.mesa,
      raw.observacoes ?? null,
      raw.status,
      (raw.itens ?? []).map((it: any) =>
        new PedidoItem(
          it.id,
          it.produtoId ?? null,
          it.nome,
          it.tamanho ?? null,
          it.quantidade,
          Number(it.precoUnit),
          it.obs ?? null,
          (it.adicionais ?? []).map((a: any) => new PedidoItemAdicional(a.nome, Number(a.preco))),
        )
      ),
      raw.createdAt,
      raw.updatedAt,
      raw.formaPagamento ?? null, // mantém no domínio como null quando não houver
    );
  },

  // ✅ usado no create() do repo
  toPrismaCreate(p: Pedido): Prisma.PedidoCreateInput {
    const data: Prisma.PedidoCreateInput = {
      id: p.id,
      mesa: p.mesa,
      observacoes: p.observacoes ?? null,
      status: p.status as any,
      total: p.total(), // se sua coluna é Decimal e você quiser, pode usar new Prisma.Decimal(p.total())
      itens: {
        create: p.itens.map(it => ({
          id: it.id,
          produtoId: it.produtoId ?? null, // nunca undefined
          nome: it.nome,
          tamanho: it.tamanho ?? null,     // nunca undefined
          quantidade: it.quantidade,
          precoUnit: it.precoUnit,
          obs: it.obs ?? null,
          adicionais: {
            create: it.adicionais.map(a => ({ nome: a.nome, preco: a.preco })),
          },
        })),
      },
    };

    // ✅ só inclui formaPagamento quando existir
    if (p.formaPagamento != null) {
      (data as any).formaPagamento = p.formaPagamento as any;
    }

    return data;
  },

  toPrismaUpdateScalars(p: Pedido): Prisma.PedidoUpdateInput {
    const data: Prisma.PedidoUpdateInput = {
      mesa: p.mesa,
      observacoes: p.observacoes ?? null,
      status: p.status as any,
      total: p.total(),
    };

    // ✅ não sobrescrever com null
    if (p.formaPagamento != null) {
      (data as any).formaPagamento = p.formaPagamento as any;
    }

    return data;
  },

  // Quando quiser substituir itens:
  toPrismaReplaceItems(p: Pedido): Prisma.PedidoUpdateInput {
    const data: Prisma.PedidoUpdateInput = {
      mesa: p.mesa,
      observacoes: p.observacoes ?? null,
      status: p.status as any,
      total: p.total(),
      itens: {
        deleteMany: { pedidoId: p.id },
        create: p.itens.map(it => ({
          id: it.id,
          produtoId: it.produtoId ?? null,
          nome: it.nome,
          tamanho: it.tamanho ?? null,
          quantidade: it.quantidade,
          precoUnit: it.precoUnit,
          obs: it.obs ?? null,
          adicionais: {
            create: it.adicionais.map(a => ({ nome: a.nome, preco: a.preco })),
          },
        })),
      },
    };

    // ✅ idem aqui
    if (p.formaPagamento != null) {
      (data as any).formaPagamento = p.formaPagamento as any;
    }

    return data;
  },
};
