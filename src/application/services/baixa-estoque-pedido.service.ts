import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/db/prisma.service';

/**
 * Baixa automática de estoque a partir da ficha técnica dos produtos de um pedido.
 *
 * Regras:
 * - Best-effort: NUNCA lança erro para o fluxo do pedido. Se o estoque estiver
 *   mal configurado (sem depósito, sem ficha técnica), a venda acontece normalmente.
 * - Idempotente via flag `estoqueBaixado` no pedido: não baixa duas vezes nem
 *   estorna o que não foi baixado.
 * - Permite saldo negativo: se vendeu, o insumo saiu — o saldo negativo sinaliza
 *   uma divergência para o dono corrigir, não bloqueia a operação.
 */
@Injectable()
export class BaixaEstoquePedidoService {
  private readonly logger = new Logger(BaixaEstoquePedidoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Dá baixa no estoque do pedido (uma única vez). */
  async ensureBaixado(pedidoId: string): Promise<void> {
    try {
      const pedido = await this.prisma.pedido.findUnique({
        where: { id: pedidoId },
        select: { id: true, numero: true, estoqueBaixado: true },
      });
      if (!pedido || pedido.estoqueBaixado) return;

      const consumo = await this.consumoPorInsumo(pedidoId);
      const depositoId = await this.depositoPadraoId();

      // Sem depósito configurado não há como registrar movimento — não marca como baixado
      // para não perder a informação caso um depósito seja criado depois.
      if (!depositoId) {
        this.logger.warn(`Pedido #${pedido.numero}: nenhum depósito ativo — baixa de estoque ignorada.`);
        return;
      }

      await this.prisma.$transaction([
        ...[...consumo.entries()].map(([insumoId, quantidade]) =>
          this.prisma.movimentoEstoque.create({
            data: {
              insumoId,
              depositoId,
              tipo: 'PRODUCAO_CONSUMO',
              quantidadeBase: quantidade,
              documentoRef: `PEDIDO:${pedido.numero}`,
              observacao: `Baixa automática — Pedido #${pedido.numero}`,
            },
          }),
        ),
        this.prisma.pedido.update({
          where: { id: pedido.id },
          data: { estoqueBaixado: true },
        }),
      ]);

      if (consumo.size > 0) {
        this.logger.log(`Pedido #${pedido.numero}: baixa de ${consumo.size} insumo(s) registrada.`);
      }
    } catch (err) {
      this.logger.error(`Falha ao baixar estoque do pedido ${pedidoId}: ${String(err)}`);
    }
  }

  /** Estorna a baixa (devolve ao estoque) caso o pedido tenha sido baixado. */
  async ensureEstornado(pedidoId: string): Promise<void> {
    try {
      const pedido = await this.prisma.pedido.findUnique({
        where: { id: pedidoId },
        select: { id: true, numero: true, estoqueBaixado: true },
      });
      if (!pedido || !pedido.estoqueBaixado) return;

      const consumo = await this.consumoPorInsumo(pedidoId);
      const depositoId = await this.depositoPadraoId();

      await this.prisma.$transaction([
        ...(depositoId
          ? [...consumo.entries()].map(([insumoId, quantidade]) =>
              this.prisma.movimentoEstoque.create({
                data: {
                  insumoId,
                  depositoId,
                  tipo: 'AJUSTE_POSITIVO',
                  quantidadeBase: quantidade,
                  documentoRef: `PEDIDO:${pedido.numero}`,
                  observacao: `Estorno de baixa — Pedido #${pedido.numero} (cancelado)`,
                },
              }),
            )
          : []),
        this.prisma.pedido.update({
          where: { id: pedido.id },
          data: { estoqueBaixado: false },
        }),
      ]);

      this.logger.log(`Pedido #${pedido.numero}: estorno de baixa registrado.`);
    } catch (err) {
      this.logger.error(`Falha ao estornar estoque do pedido ${pedidoId}: ${String(err)}`);
    }
  }

  /** Soma, por insumo, a quantidade consumida (ficha técnica × quantidade do item). */
  private async consumoPorInsumo(pedidoId: string): Promise<Map<string, number>> {
    const itens = await this.prisma.pedidoItem.findMany({
      where: { pedidoId, produtoId: { not: null } },
      select: {
        quantidade: true,
        produto: {
          select: {
            fichaTecnica: { select: { insumoId: true, quantidade: true } },
          },
        },
      },
    });

    const acc = new Map<string, number>();
    for (const item of itens) {
      const ficha = item.produto?.fichaTecnica ?? [];
      for (const linha of ficha) {
        const total = Number(linha.quantidade) * Number(item.quantidade);
        if (!(total > 0)) continue;
        acc.set(linha.insumoId, (acc.get(linha.insumoId) ?? 0) + total);
      }
    }
    return acc;
  }

  /** Depósito padrão para os movimentos: o primeiro depósito ativo (mais antigo). */
  private async depositoPadraoId(): Promise<string | null> {
    const dep = await this.prisma.deposito.findFirst({
      where: { ativo: true },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    return dep?.id ?? null;
  }
}
