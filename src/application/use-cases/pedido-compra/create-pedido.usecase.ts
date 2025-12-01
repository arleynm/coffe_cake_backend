import { BadRequestException, Injectable } from '@nestjs/common';
import { PedidoCompraRepository } from '../../../domain/estoque/repositories/pedido-compra.repository';
import { PedidoCompra } from '../../../domain/estoque/entities/pedido-compra.entity';

@Injectable()
export class CreatePedidoUseCase {
  constructor(private repo: PedidoCompraRepository) {}

  async execute(input: {
    numero?: string;
    fornecedor?: string | null;
    itens: {
      insumoId: string;
      quantidadeBase: number;
      custoUnitario: string;
      depositoId: string;
      loteCodigo?: string | null;
      validade?: string | Date | null;
    }[];
  }): Promise<PedidoCompra> {
    if (!input.itens?.length) {
      throw new BadRequestException('Pedido precisa ter pelo menos 1 item.');
    }
    const itens = input.itens.map(it => {
      if (!(it.quantidadeBase > 0)) throw new BadRequestException('Quantidade deve ser > 0.');
      if (!/^-?\d+(\.\d+)?$/.test(it.custoUnitario)) throw new BadRequestException('custoUnitario inválido.');
      const validade = typeof it.validade === 'string' ? new Date(it.validade) : (it.validade ?? null);
      return { ...it, validade };
    });

    return this.repo.create({
      numero: input.numero,
      fornecedor: input.fornecedor ?? null,
      itens,
    });
  }
}
