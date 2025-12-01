import { BadRequestException, Injectable } from '@nestjs/common';
import { PedidoCompraRepository } from '../../../domain/estoque/repositories/pedido-compra.repository';

@Injectable()
export class ReceberPedidoUseCase {
  constructor(private repo: PedidoCompraRepository) {}

  async execute(input: {
    pedidoId: string;
    documentoRef?: string | null;
    observacao?: string | null;
    itens?: {
      insumoId: string;
      quantidadeBase: number;
      custoUnitario: string;
      depositoId: string;
      loteCodigo?: string | null;
      validade?: string | Date | null;
    }[];
  }) {
    if (!input.pedidoId) throw new BadRequestException('pedidoId é obrigatório.');
    const itens =
      input.itens?.map(it => ({
        ...it,
        validade: typeof it.validade === 'string' ? new Date(it.validade) : (it.validade ?? null),
      })) ?? undefined;

    return this.repo.receber({
      pedidoId: input.pedidoId,
      documentoRef: input.documentoRef ?? null,
      observacao: input.observacao ?? null,
      itens,
    });
  }
}
