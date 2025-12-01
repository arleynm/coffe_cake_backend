import { IPedidoRepo } from '../../../domain/pedido/pedido.repo';

export class GetPedido { constructor(private repo: IPedidoRepo) {} execute(id: string){ return this.repo.findById(id); } }