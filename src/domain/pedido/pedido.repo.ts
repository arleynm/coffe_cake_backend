// src/domain/pedido/pedido.repo.ts
import { Pedido } from './pedido.entity';
import type { PedidoStatus } from './pedido.entity';

export interface IPedidoRepo {
  findById(id: string): Promise<Pedido | null>;
  findMany(params: {
    q?: string;
    status?: PedidoStatus;
    skip?: number;
    take?: number;
    todos?: boolean;      // ⬅️ novo
  }): Promise<Pedido[]>;
  create(p: Pedido): Promise<Pedido>;
  update(p: Pedido): Promise<Pedido>;
  updateWithItems(p: Pedido): Promise<Pedido>;
  remove(id: string): Promise<void>;
}
