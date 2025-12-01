
import { IPedidoRepo } from '../../../domain/pedido/pedido.repo';
export class RemovePedido { constructor(private repo: IPedidoRepo) {} execute(id: string){ return this.repo.remove(id); } }