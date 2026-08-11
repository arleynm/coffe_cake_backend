import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/db/prisma.service';

const num = (v: unknown) => Number(v ?? 0);

@Injectable()
export class FinanceiroService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resumo financeiro consolidado no período [from, to].
   * Receita realizada = pedidos com status ENTREGUE (pagos/entregues).
   */
  async resumo(fromStr?: string, toStr?: string) {
    const now = new Date();
    const from = fromStr ? new Date(fromStr) : new Date(now.getFullYear(), now.getMonth(), 1);
    const to = toStr ? new Date(toStr) : now;

    const periodo = { gte: from, lte: to };
    const whereEntregue = { status: 'ENTREGUE' as const, createdAt: periodo };

    const [aggEntregue, aggCancelado, porForma, porAtend, entregues, itens] = await Promise.all([
      this.prisma.pedido.aggregate({
        where: whereEntregue,
        _sum: { total: true, taxaEntrega: true },
        _count: { _all: true },
      }),
      this.prisma.pedido.aggregate({
        where: { status: 'CANCELADO', createdAt: periodo },
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.pedido.groupBy({
        by: ['formaPagamento'],
        where: whereEntregue,
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.pedido.groupBy({
        by: ['tipoAtendimento'],
        where: whereEntregue,
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.pedido.findMany({
        where: whereEntregue,
        select: { id: true, numero: true, mesa: true, total: true, tipoAtendimento: true, formaPagamento: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pedidoItem.findMany({
        where: { pedido: whereEntregue },
        select: { nome: true, quantidade: true, precoUnit: true, produto: { select: { precoCusto: true } } },
      }),
    ]);

    const faturamento = num(aggEntregue._sum.total);
    const pedidos = aggEntregue._count._all;
    const ticketMedio = pedidos > 0 ? faturamento / pedidos : 0;

    // Custo/lucro estimado (só considera itens com precoCusto cadastrado)
    let custoEstimado = 0;
    const topMap = new Map<string, { nome: string; quantidade: number; total: number }>();
    for (const it of itens) {
      const qtd = num(it.quantidade);
      const receita = num(it.precoUnit) * qtd;
      const custo = it.produto?.precoCusto != null ? num(it.produto.precoCusto) * qtd : 0;
      custoEstimado += custo;
      const cur = topMap.get(it.nome) ?? { nome: it.nome, quantidade: 0, total: 0 };
      cur.quantidade += qtd;
      cur.total += receita;
      topMap.set(it.nome, cur);
    }
    const topProdutos = [...topMap.values()].sort((a, b) => b.total - a.total).slice(0, 8);

    // Faturamento por dia (agrupado em JS a partir dos pedidos entregues)
    const diaMap = new Map<string, number>();
    for (const p of entregues) {
      const key = p.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      diaMap.set(key, (diaMap.get(key) ?? 0) + num(p.total));
    }
    const porDia = [...diaMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, value]) => ({ label, value: Number(value.toFixed(2)) }));

    return {
      periodo: { from: from.toISOString(), to: to.toISOString() },
      kpis: {
        faturamento: Number(faturamento.toFixed(2)),
        pedidos,
        ticketMedio: Number(ticketMedio.toFixed(2)),
        taxaEntregaTotal: Number(num(aggEntregue._sum.taxaEntrega).toFixed(2)),
        custoEstimado: Number(custoEstimado.toFixed(2)),
        lucroEstimado: Number((faturamento - custoEstimado).toFixed(2)),
        canceladosCount: aggCancelado._count._all,
        canceladosValor: Number(num(aggCancelado._sum.total).toFixed(2)),
      },
      porFormaPagamento: porForma
        .map((f) => ({ forma: f.formaPagamento ?? 'NAO_INFORMADO', total: Number(num(f._sum.total).toFixed(2)), count: f._count._all }))
        .sort((a, b) => b.total - a.total),
      porAtendimento: porAtend
        .map((a) => ({ tipo: a.tipoAtendimento, total: Number(num(a._sum.total).toFixed(2)), count: a._count._all }))
        .sort((a, b) => b.total - a.total),
      porDia,
      topProdutos: topProdutos.map((t) => ({ ...t, total: Number(t.total.toFixed(2)) })),
      transacoes: entregues.slice(0, 50).map((p) => ({
        id: p.id,
        numero: p.numero,
        mesa: p.mesa,
        tipoAtendimento: p.tipoAtendimento,
        formaPagamento: p.formaPagamento,
        total: num(p.total),
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }
}
