import { Injectable } from '@nestjs/common';
import { PedidoCompraRepository } from '../../../domain/estoque/repositories/pedido-compra.repository';
import { PedidoCompra } from '../../../domain/estoque/entities/pedido-compra.entity';

@Injectable()
export class ListPedidosUseCase {
  constructor(private repo: PedidoCompraRepository) {}
  execute(input?: { status?: 'ABERTO' | 'RECEBIDO' | 'CANCELADO' }): Promise<PedidoCompra[]> {
    return this.repo.findAll({ status: input?.status });
  }
}
