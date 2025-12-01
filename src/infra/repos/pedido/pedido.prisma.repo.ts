// src/infra/repos/pedido/pedido.prisma.repo.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/db/prisma.service';
import { IPedidoRepo } from '../../../domain/pedido/pedido.repo';
import { Pedido } from '../../../domain/pedido/pedido.entity';
import { PedidoPrismaMapper } from '../../mappers/pedido.prisma.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PedidoPrismaRepo implements IPedidoRepo {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Pedido | null> {
    const raw = await this.prisma.pedido.findUnique({
      where: { id },
      include: { itens: { include: { adicionais: true } } },
    });
    return raw ? PedidoPrismaMapper.toDomain(raw) : null;
  }

  async findMany(params: {
    q?: string;
    status?: any;
    skip?: number;
    take?: number;
    todos?: boolean;
  } = {}): Promise<Pedido[]> {
    const { q, status, skip, take, todos } = params ?? {};

    // saneia paginação
    const safeSkip = Number.isFinite(skip as number) ? (skip as number) : 0;
    const safeTake = Number.isFinite(take as number) ? (take as number) : 50;

    const or: Prisma.PedidoWhereInput[] = [];
    if (q) {
      or.push({ mesa: { contains: q } }); // ← sem `mode`
      const n = Number(q);
      if (!Number.isNaN(n)) or.push({ numero: n } as any);
    }

    const where: Prisma.PedidoWhereInput = {};
    if (or.length) where.OR = or;

    if (status != null && status !== '') {
      (where as any).status = status;
    } else if (!todos) {
      // regra padrão: ocultar ENTREGUE quando status não foi especificado
      (where as any).status = { not: 'ENTREGUE' };
    }
    // se todos=true e status não veio, não filtra status

    const raws = await this.prisma.pedido.findMany({
      where,
      orderBy: { createdAt: 'desc' }, // ou { numero: 'desc' } se preferir
      skip: safeSkip,
      take: safeTake,
      include: { itens: { include: { adicionais: true } } },
    });

    return raws.map(PedidoPrismaMapper.toDomain);
  }

  async create(p: Pedido): Promise<Pedido> {
    const raw = await this.prisma.pedido.create({
      data: PedidoPrismaMapper.toPrismaCreate(p),
      include: { itens: { include: { adicionais: true } } },
    });
    return PedidoPrismaMapper.toDomain(raw);
  }

  async update(p: Pedido): Promise<Pedido> {
    const raw = await this.prisma.pedido.update({
      where: { id: p.id },
      data: {
        mesa: p.mesa,
        observacoes: p.observacoes ?? null,
        status: p.status as any,
        // se o domínio já tiver formaPagamento
        // formaPagamento: (p as any).formaPagamento as any,
        total: p.total(),
        updatedAt: new Date(),
      },
      include: { itens: { include: { adicionais: true } } },
    });
    return PedidoPrismaMapper.toDomain(raw);
  }

  async updateWithItems(p: Pedido): Promise<Pedido> {
    const raw = await this.prisma.pedido.update({
      where: { id: p.id },
      data: PedidoPrismaMapper.toPrismaReplaceItems(p),
      include: { itens: { include: { adicionais: true } } },
    });
    return PedidoPrismaMapper.toDomain(raw);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.pedidoItemAdicional.deleteMany({ where: { item: { pedidoId: id } } }),
      this.prisma.pedidoItem.deleteMany({ where: { pedidoId: id } }),
      this.prisma.pedido.delete({ where: { id } }),
    ]);
  }
}
