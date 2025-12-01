import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { PedidoCompraRepository, CreatePedidoItemInput } from '../../../domain/estoque/repositories/pedido-compra.repository';
import { PedidoCompra } from '../../../domain/estoque/entities/pedido-compra.entity';
import { PedidoCompraMapper } from '../../mappers/pedido-compra.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaPedidoCompraRepository implements PedidoCompraRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    numero?: string; fornecedor?: string | null; itens: CreatePedidoItemInput[];
  }): Promise<PedidoCompra> {
    const created = await this.prisma.pedidoCompra.create({
      data: PedidoCompraMapper.toPrismaCreate(data),
      include: { itens: true },
    });
    return PedidoCompraMapper.toDomain(created);
  }

  async findAll(filter?: { status?: 'ABERTO' | 'RECEBIDO' | 'CANCELADO' }): Promise<PedidoCompra[]> {
    const list = await this.prisma.pedidoCompra.findMany({
      where: { status: filter?.status ?? undefined },
      orderBy: { createdAt: 'desc' },
      include: { itens: true },
    });
    return list.map(PedidoCompraMapper.toDomain);
  }

  async findById(id: string): Promise<PedidoCompra | null> {
    const p = await this.prisma.pedidoCompra.findUnique({
      where: { id },
      include: { itens: true },
    });
    return p ? PedidoCompraMapper.toDomain(p) : null;
  }

  async receber(params: {
    pedidoId: string;
    itens?: CreatePedidoItemInput[];
    documentoRef?: string | null;
    observacao?: string | null;
  }): Promise<{ pedido: PedidoCompra; movimentosEntradaIds: string[]; lotesCriadosIds: string[] }> {
    const pedido = await this.prisma.pedidoCompra.findUnique({
      where: { id: params.pedidoId },
      include: { itens: true },
    });
    if (!pedido) throw new NotFoundException('Pedido não encontrado.');
    if (pedido.status !== 'ABERTO') throw new BadRequestException('Apenas pedidos ABERTOS podem ser recebidos.');

    const itens = params.itens ?? pedido.itens.map(i => ({
      insumoId: i.insumoId,
      quantidadeBase: i.quantidadeBase,
      custoUnitario: i.custoUnitario.toString(),
      depositoId: i.depositoId,
      loteCodigo: i.loteCodigo ?? null,
      validade: i.validade ?? null,
    }));

    const result = await this.prisma.$transaction(async (tx) => {
      const movimentosIds: string[] = [];
      const lotesIds: string[] = [];

      for (const it of itens) {
        // cria Lote somente se tiver metadata (codigo/validade); caso contrário, entrada sem lote
        let loteId: string | null = null;
        if (it.loteCodigo ?? it.validade) {
          const lote = await tx.lote.create({
            data: {
              insumoId: it.insumoId,
              depositoId: it.depositoId,
              codigo: it.loteCodigo ?? null,
              validade: it.validade ?? null,
            },
          });
          loteId = lote.id;
          lotesIds.push(lote.id);
        }

        const mov = await tx.movimentoEstoque.create({
          data: {
            insumoId: it.insumoId,
            depositoId: it.depositoId,
            tipo: 'ENTRADA',
            quantidadeBase: it.quantidadeBase,
            loteId,
            custoUnitario: new Prisma.Decimal(it.custoUnitario),
            documentoRef: params.documentoRef ?? pedido.numero ?? null,
            observacao: params.observacao ?? null,
          },
        });
        movimentosIds.push(mov.id);
      }

      const pedAtualizado = await tx.pedidoCompra.update({
        where: { id: pedido.id },
        data: { status: 'RECEBIDO' },
        include: { itens: true },
      });

      return { pedAtualizado, movimentosIds, lotesIds };
    });

    return {
      pedido: PedidoCompraMapper.toDomain(result.pedAtualizado),
      movimentosEntradaIds: result.movimentosIds,
      lotesCriadosIds: result.lotesIds,
    };
  }

  async cancelar(pedidoId: string): Promise<PedidoCompra> {
    const pedido = await this.prisma.pedidoCompra.findUnique({ where: { id: pedidoId } });
    if (!pedido) throw new NotFoundException('Pedido não encontrado.');
    if (pedido.status !== 'ABERTO') throw new BadRequestException('Apenas pedidos ABERTOS podem ser cancelados.');

    const updated = await this.prisma.pedidoCompra.update({
      where: { id: pedidoId },
      data: { status: 'CANCELADO' },
      include: { itens: true },
    });
    return PedidoCompraMapper.toDomain(updated);
  }
}
