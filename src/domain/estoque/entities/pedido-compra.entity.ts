import { PedidoCompraItem } from './pedido-compra-item.entity';

export type PedidoStatus = 'ABERTO' | 'RECEBIDO' | 'CANCELADO';

export class PedidoCompra {
  constructor(
    public readonly id: string,
    public numero: string,                        // no schema é obrigatório e único
    public fornecedor: string | null = null,
    public status: PedidoStatus = 'ABERTO',
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public itens: PedidoCompraItem[] = [],
  ) {
    this.numero = numero.trim();
    if (!this.numero) throw new Error('Número do pedido é obrigatório.');
    if (!['ABERTO', 'RECEBIDO', 'CANCELADO'].includes(status)) {
      throw new Error('Status inválido para PedidoCompra.');
    }
  }
}
