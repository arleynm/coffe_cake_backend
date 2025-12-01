// domínio puro: sem Nest/Prisma aqui
export type Tamanho = 'P'|'M'|'G';
export type PedidoStatus = 'RECEBIDO'|'PREPARO'|'PRONTO'|'ENTREGUE'|'CANCELADO';

// ✅ novo enum simples para pagamento
export type FormaPagamento = 'PIX'|'DINHEIRO'|'CARTAO_CREDITO'|'CARTAO_DEBITO';

export class PedidoItemAdicional {
  constructor(
    public readonly nome: string,
    public readonly preco: number,
  ) {}
}

export class PedidoItem {
  constructor(
    public readonly id: string,
    public readonly produtoId: string | null,
    public nome: string,
    public tamanho: Tamanho | null,
    public quantidade: number,
    public precoUnit: number,
    public obs: string | null,
    public adicionais: PedidoItemAdicional[] = [],
  ) {}
  subtotal() { return Number((this.precoUnit * this.quantidade).toFixed(2)); }
}

export class Pedido {
  constructor(
    public readonly id: string,
    public numero: number,
    public mesa: string,
    public observacoes: string | null,
    public status: PedidoStatus,
    public itens: PedidoItem[] = [],
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    // ✅ novo campo opcional
    public formaPagamento: FormaPagamento | null = null,
  ) {}

  private touch() { this.updatedAt = new Date(); }

  total(): number {
    return Number(this.itens.reduce((acc, it) => acc + it.subtotal(), 0).toFixed(2));
  }

  /**
   * Troca de status com regras simples:
   * - Não muda status se já estiver CANCELADO (exceto setar CANCELADO, que é imediato)
   * - Mantém ordem RECEBIDO -> PREPARO -> PRONTO -> ENTREGUE
   * - `formaPagamento` é opcional; se vier, atualiza o campo
   */
  changeStatus(next: PedidoStatus, formaPagamento?: FormaPagamento) {
    const order: PedidoStatus[] = ['RECEBIDO','PREPARO','PRONTO','ENTREGUE'];
    if (this.status === 'CANCELADO') throw new Error('Pedido cancelado não muda status');
    if (next === 'CANCELADO') { 
      this.status = next; 
      this.touch();
      return; 
    }
    const ok = order.indexOf(next) >= order.indexOf(this.status);
    if (!ok) throw new Error('Transição de status inválida');

    this.status = next;
    if (typeof formaPagamento !== 'undefined') {
      this.formaPagamento = formaPagamento; // opcional e suave
    }
    this.touch();
  }

  /**
   * Setter explícito caso você queira mudar/limpar o pagamento em separado.
   */
  setFormaPagamento(fp: FormaPagamento | null) {
    if (this.status === 'CANCELADO') throw new Error('Pedido cancelado não aceita forma de pagamento');
    this.formaPagamento = fp;
    this.touch();
  }
}
