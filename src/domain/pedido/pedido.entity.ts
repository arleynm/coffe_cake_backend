// domínio puro: sem Nest/Prisma aqui
export type Tamanho = 'P'|'M'|'G';
export type PedidoStatus = 'RECEBIDO'|'PREPARO'|'PRONTO'|'ENTREGUE'|'CANCELADO';

// ✅ novo enum simples para pagamento
export type FormaPagamento = 'PIX'|'DINHEIRO'|'CARTAO_CREDITO'|'CARTAO_DEBITO';
export type TipoAtendimento = 'LOCAL'|'RETIRADA'|'ENTREGA';

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
    public tipoAtendimento: TipoAtendimento = 'LOCAL',
    public clienteNome: string | null = null,
    public clienteTelefone: string | null = null,
    public deliveryZoneId: string | null = null,
    public enderecoCep: string | null = null,
    public enderecoRua: string | null = null,
    public enderecoNumero: string | null = null,
    public enderecoBairro: string | null = null,
    public enderecoCidade: string | null = null,
    public enderecoUf: string | null = null,
    public enderecoComplemento: string | null = null,
    public taxaEntrega: number = 0,
    public entregaLatitude: number | null = null,
    public entregaLongitude: number | null = null,
    public entregaPrevistaEm: Date | null = null,
  ) {}

  private touch() { this.updatedAt = new Date(); }

  total(): number {
    return Number((this.itens.reduce((acc, it) => acc + it.subtotal(), 0) + this.taxaEntrega).toFixed(2));
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
