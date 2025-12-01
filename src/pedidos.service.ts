import { Injectable } from '@nestjs/common';
import { PrismaService } from './infra/db/prisma.service';
import { PedidosEventsService } from './pedidos.events.service';
import { Prisma } from '@prisma/client';
import { CreatePedidoHttpDTO, UpdatePedidoHttpDTO } from './infra/http/dtos/pedido.dto';

@Injectable()
export class PedidosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: PedidosEventsService,
  ) {}

  async create(dto: CreatePedidoHttpDTO) {
    // CreatePedidoHttpDTO.itens é obrigatório, então não precisa checar undefined
    const total = this.calcTotal(dto.itens);

    const created = await this.prisma.pedido.create({
      data: {
        mesa: dto.mesa,
        observacoes: dto.observacoes ?? null,
        total: new Prisma.Decimal(total),
        itens: {
          create: dto.itens.map(i => ({
            produtoId: i.produtoId ?? null,
            nome: i.nome,
            tamanho: i.tamanho ?? null,
            quantidade: i.quantidade,
            precoUnit: new Prisma.Decimal(i.precoUnit),
            obs: i.obs ?? null,
            adicionais: {
              create: (i.adicionais ?? []).map(a => ({
                nome: a.nome,
                preco: new Prisma.Decimal(a.preco),
              })),
            },
          })),
        },
      },
      include: { itens: { include: { adicionais: true } } },
    });

    const fe = this.toFE(created);
    this.eventBus.emit('pedido.created', fe);
    return fe;
  }

  async update(id: string, dto: UpdatePedidoHttpDTO) {
    // Se vierem itens, recalcula total e substitui os itens (exemplo simples com transação).
    if (dto.itens && dto.itens.length) {
      const total = this.calcTotal(dto.itens);

      const updated = await this.prisma.$transaction(async (tx) => {
        // apaga adicionais e itens antigos (ajuste conforme seu schema)
        await tx.pedidoItemAdicional.deleteMany({ where: { item: { pedidoId: id } } });
        await tx.pedidoItem.deleteMany({ where: { pedidoId: id } });

        return tx.pedido.update({
          where: { id },
          data: {
            mesa: dto.mesa ?? undefined,
            observacoes: dto.observacoes ?? undefined,
            total: new Prisma.Decimal(total),
            itens: {
              create: dto.itens!.map(i => ({
                produtoId: i.produtoId ?? null,
                nome: i.nome,
                tamanho: i.tamanho ?? null,
                quantidade: i.quantidade,
                precoUnit: new Prisma.Decimal(i.precoUnit),
                obs: i.obs ?? null,
                adicionais: {
                  create: (i.adicionais ?? []).map(a => ({
                    nome: a.nome,
                    preco: new Prisma.Decimal(a.preco),
                  })),
                },
              })),
            },
          },
          include: { itens: { include: { adicionais: true } } },
        });
      });

      const fe = this.toFE(updated);
      this.eventBus.emit('pedido.updated', fe);
      return fe;
    }

    // Patch sem itens -> não mexe no total
    const updated = await this.prisma.pedido.update({
      where: { id },
      data: {
        mesa: dto.mesa ?? undefined,
        observacoes: dto.observacoes ?? undefined,
      },
      include: { itens: { include: { adicionais: true } } },
    });

    const fe = this.toFE(updated);
    this.eventBus.emit('pedido.updated', fe);
    return fe;
  }

  async changeStatus(
    id: string,
    status: 'RECEBIDO'|'PREPARO'|'PRONTO'|'ENTREGUE'|'CANCELADO'
  ) {
    const p = await this.prisma.pedido.update({
      where: { id },
      data: { status },
      include: { itens: { include: { adicionais: true } } },
    });

    const fe = this.toFE(p);
    this.eventBus.emit('pedido.status', fe);
    return fe;
  }

  async remove(id: string) {
    await this.prisma.pedido.delete({ where: { id } });
    this.eventBus.emit('pedido.deleted', { id });
  }

  // ========= Helpers =========
  private calcTotal(
    itens: Array<{ precoUnit: number; quantidade: number }>
  ): number {
    const t = itens.reduce((acc, i) => acc + Number(i.precoUnit) * Number(i.quantidade), 0);
    return Math.round(t * 100) / 100; // 2 casas
  }

  private toFE(db: any) {
    return {
      id: db.id,
      numero: db.numero,
      mesa: db.mesa ?? '',
      observacoes: db.observacoes ?? null,
      status: String(db.status ?? '').toLowerCase(), // 'RECEBIDO' -> 'recebido'
      createdAt: db.createdAt,
      updatedAt: db.updatedAt,
      total: Number(db.total ?? 0),
      itens: (db.itens ?? []).map((i: any) => ({
        id: i.id,
        produtoId: i.produtoId ?? '',
        nome: i.nome,
        tamanho: i.tamanho ?? undefined,
        quantidade: Number(i.quantidade),
        precoUnit: Number(i.precoUnit),
        obs: i.obs ?? undefined,
        adicionais: (i.adicionais ?? []).map((a: any) => ({
          id: a.id,
          nome: a.nome,
          preco: Number(a.preco),
        })),
      })),
    };
  }
}
