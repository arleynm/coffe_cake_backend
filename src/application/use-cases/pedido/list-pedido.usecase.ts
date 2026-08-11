import { IPedidoRepo } from '../../../domain/pedido/pedido.repo';
import type { PedidoStatus } from '../../../domain/pedido/pedido.entity';

type ListParams = {
  q?: string;
  status?: PedidoStatus;
  skip?: number;
  take?: number;
  todos?: boolean;
  mesa?: string;
};

export class ListPedido {
  constructor(private readonly repo: IPedidoRepo) {}

  async execute(params: ListParams = {}) {
    const {
      q,
      status,
      skip = 0,
      take = 50,
      todos = false,
      mesa,
    } = params;

    return this.repo.findMany({ q, status, skip, take, todos, mesa });
  }
}