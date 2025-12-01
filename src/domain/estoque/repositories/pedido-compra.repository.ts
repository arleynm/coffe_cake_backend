import { PedidoCompra } from '../entities/pedido-compra.entity';
import { PedidoCompraItem } from '../entities/pedido-compra-item.entity';

export type PedidoStatus = 'ABERTO' | 'RECEBIDO' | 'CANCELADO';

export type CreatePedidoItemInput = {
  insumoId: string;
  quantidadeBase: number;
  custoUnitario: string;   // string por causa do Decimal
  depositoId: string;
  loteCodigo?: string | null;
  validade?: Date | null;
};

export abstract class PedidoCompraRepository {
  abstract create(data: {
    numero?: string;            // opcional (pode ser gerado)
    fornecedor?: string | null;
    itens: CreatePedidoItemInput[];
  }): Promise<PedidoCompra>;

  abstract findAll(filter?: { status?: PedidoStatus }): Promise<PedidoCompra[]>;
  abstract findById(id: string): Promise<PedidoCompra | null>;

  /**
   * Recebe o pedido:
   * - Cria Lote (se loteCodigo/validade fornecidos) para cada item
   * - Gera MovimentoEstoque(ENTRADA) com custoUnitario
   * - Atualiza status do pedido para RECEBIDO
   * - Retorna o pedido atualizado
   */
  abstract receber(params: {
    pedidoId: string;
    // itens override (opcional): se informado, usa estes itens em vez dos cadastrados
    itens?: CreatePedidoItemInput[];
    documentoRef?: string | null;
    observacao?: string | null;
  }): Promise<{ pedido: PedidoCompra; movimentosEntradaIds: string[]; lotesCriadosIds: string[] }>;

  abstract cancelar(pedidoId: string): Promise<PedidoCompra>;
}
