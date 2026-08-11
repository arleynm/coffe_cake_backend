import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/db/prisma.service';

const TIPOS = ['venda', 'despesa', 'suprimento', 'sangria', 'estorno'];
const num = (v: unknown) => Number(v ?? 0);

@Injectable()
export class CaixaService {
  constructor(private readonly prisma: PrismaService) {}

  /** Serializa no formato que o frontend já usa (tipos/métodos em minúsculo). */
  private serialize(t: any) {
    return {
      id: t.id,
      status: t.status,
      openedAt: t.abertoEm,
      openedBy: t.abertoPor,
      openingAmount: num(t.aberturaValor),
      closedAt: t.fechadoEm ?? null,
      closedBy: t.fechadoPor ?? null,
      declaredCash: t.valorDeclarado != null ? num(t.valorDeclarado) : null,
      difference: t.diferenca != null ? num(t.diferenca) : null,
      movements: (t.movimentos ?? []).map((m: any) => ({
        id: m.id,
        createdAt: m.createdAt,
        type: m.tipo,
        method: m.metodo ?? null,
        amount: num(m.valor),
        orderNumber: m.pedidoNumero ?? null,
        description: m.descricao ?? null,
      })),
    };
  }

  /** Dinheiro esperado na gaveta (abertura + entradas/saídas em dinheiro). */
  private cashInDrawer(t: any): number {
    let sum = num(t.aberturaValor);
    for (const m of t.movimentos ?? []) {
      const v = Math.abs(num(m.valor));
      const entra = m.tipo === 'venda' || m.tipo === 'suprimento';
      const afetaGaveta = m.metodo == null || m.metodo === 'dinheiro';
      if (afetaGaveta) sum += entra ? v : -v;
    }
    return Number(sum.toFixed(2));
  }

  async atual() {
    const t = await this.prisma.caixaTurno.findFirst({
      where: { status: 'aberto' },
      include: { movimentos: { orderBy: { createdAt: 'desc' } } },
      orderBy: { abertoEm: 'desc' },
    });
    return t ? this.serialize(t) : null;
  }

  async abrir(input: { openingAmount?: number; openedBy?: string }) {
    const aberto = await this.prisma.caixaTurno.findFirst({ where: { status: 'aberto' } });
    if (aberto) throw new BadRequestException('Já existe um caixa aberto.');
    const t = await this.prisma.caixaTurno.create({
      data: { status: 'aberto', aberturaValor: Math.max(0, num(input.openingAmount)), abertoPor: input.openedBy ?? null },
      include: { movimentos: true },
    });
    return this.serialize(t);
  }

  async addMovimento(input: { type: string; method?: string | null; amount: number; orderNumber?: number | null; description?: string | null }) {
    const t = await this.prisma.caixaTurno.findFirst({ where: { status: 'aberto' } });
    if (!t) throw new BadRequestException('Nenhum caixa aberto.');
    if (!TIPOS.includes(input.type)) throw new BadRequestException('Tipo de movimentação inválido.');
    if (!(num(input.amount) > 0)) throw new BadRequestException('Informe um valor maior que zero.');

    // método só se aplica a venda/estorno; demais entram/saem da gaveta (dinheiro)
    const metodo = input.type === 'venda' || input.type === 'estorno' ? (input.method ?? null) : null;

    await this.prisma.caixaMovimento.create({
      data: {
        turnoId: t.id,
        tipo: input.type,
        metodo,
        valor: Math.abs(num(input.amount)),
        pedidoNumero: input.orderNumber ?? null,
        descricao: input.description ?? null,
      },
    });
    return this.atual();
  }

  async fechar(input: { declaredCash?: number; closedBy?: string }) {
    const t = await this.prisma.caixaTurno.findFirst({ where: { status: 'aberto' }, include: { movimentos: true } });
    if (!t) throw new BadRequestException('Nenhum caixa aberto.');
    const esperado = this.cashInDrawer(t);
    const declarado = num(input.declaredCash);
    const diferenca = Number((declarado - esperado).toFixed(2));
    await this.prisma.caixaTurno.update({
      where: { id: t.id },
      data: { status: 'fechado', fechadoEm: new Date(), fechadoPor: input.closedBy ?? null, valorDeclarado: declarado, diferenca },
    });
    return { fechado: true, esperado, declarado, diferenca };
  }

  /**
   * Lança automaticamente uma venda no caixa aberto a partir de um pedido pago/entregue.
   * Best-effort: nunca quebra o fluxo do pedido. Idempotente por pedidoNumero.
   */
  async registrarVendaDePedido(pedido: { numero: number; total: number; formaPagamento?: string | null; tipoAtendimento?: string | null }) {
    try {
      const turno = await this.prisma.caixaTurno.findFirst({ where: { status: 'aberto' } });
      if (!turno) return; // sem caixa aberto → não importa (abra o caixa para capturar as vendas)

      // evita duplicar: se este pedido já virou venda no caixa, ignora
      const existe = await this.prisma.caixaMovimento.findFirst({ where: { tipo: 'venda', pedidoNumero: pedido.numero } });
      if (existe) return;

      const map: Record<string, string> = { DINHEIRO: 'dinheiro', PIX: 'pix', CARTAO_CREDITO: 'cartao', CARTAO_DEBITO: 'cartao' };
      const metodo = pedido.formaPagamento ? (map[pedido.formaPagamento] ?? 'dinheiro') : 'dinheiro';

      await this.prisma.caixaMovimento.create({
        data: {
          turnoId: turno.id,
          tipo: 'venda',
          metodo,
          valor: Math.max(0, num(pedido.total)),
          pedidoNumero: pedido.numero,
          descricao: `Pedido #${pedido.numero}${pedido.tipoAtendimento ? ` · ${pedido.tipoAtendimento}` : ''}`,
        },
      });
    } catch {
      /* best-effort: não interrompe a mudança de status do pedido */
    }
  }

  async historico() {
    const list = await this.prisma.caixaTurno.findMany({
      where: { status: 'fechado' },
      include: { movimentos: true },
      orderBy: { fechadoEm: 'desc' },
      take: 30,
    });
    return list.map((t) => this.serialize(t));
  }
}
