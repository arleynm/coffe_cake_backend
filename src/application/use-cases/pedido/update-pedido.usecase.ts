import { IPedidoRepo } from '../../../domain/pedido/pedido.repo';
import { PedidoItem, PedidoItemAdicional } from '../../../domain/pedido/pedido.entity';
import { randomUUID } from 'crypto';
import { UpdatePedidoDTO } from './dtos';

export class UpdatePedido {
  constructor(private repo: IPedidoRepo) {}
  async execute(id: string, input: UpdatePedidoDTO) {
    const found = await this.repo.findById(id);
    if (!found) throw new Error('Pedido não encontrado');

    if (typeof input.mesa === 'string') found.mesa = input.mesa;
    if ('observacoes' in input) found.observacoes = input.observacoes ?? null;

    if (input.itens) {
      found.itens = input.itens.map(i => new PedidoItem(
        randomUUID(), i.produtoId ?? null, i.nome, i.tamanho ?? null,
        i.quantidade, i.precoUnit, i.obs ?? null,
        (i.adicionais ?? []).map(a => new PedidoItemAdicional(a.nome, a.preco)),
      ));
      // itens mudaram → precisa substituí-los no banco (update simples não persiste itens)
      return this.repo.updateWithItems(found);
    }

    return this.repo.update(found);
  }
}
