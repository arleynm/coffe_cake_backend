// src/application/use-cases/pedido/change-status.usecase.ts
import { IPedidoRepo } from '../../../domain/pedido/pedido.repo';
import type { PedidoStatus, FormaPagamento } from '../../../domain/pedido/pedido.entity';

export class ChangePedidoStatus {
  constructor(private repo: IPedidoRepo) {}

  async execute(id: string, next?: PedidoStatus, formaPagamento?: FormaPagamento) {
    const p = await this.repo.findById(id);
    if (!p) throw new Error('Pedido não encontrado');

    // ✅ Se veio status, aplica direto (sem regras de “ordem”)
    if (typeof next !== 'undefined') {
      p.status = next;
    }

    // ✅ Se veio forma de pagamento, aplica (pode vir sozinho ou junto do status)
    if (typeof formaPagamento !== 'undefined') {
      p.formaPagamento = formaPagamento;
    }

    return this.repo.update(p);
  }
}
