import { IPedidoRepo } from '../../../domain/pedido/pedido.repo';
import { Pedido, PedidoItem, PedidoItemAdicional } from '.././../../domain/pedido/pedido.entity';
import { randomUUID } from 'crypto';
import { CreatePedidoDTO } from './dtos';

export class CreatePedido {
  constructor(private repo: IPedidoRepo) {}
  async execute(input: CreatePedidoDTO) {
    const itens = input.itens.map(i => new PedidoItem(
      randomUUID(),
      i.produtoId ?? null,
      i.nome,
      i.tamanho ?? null,
      i.quantidade,
      i.precoUnit,
      i.obs ?? null,
      (i.adicionais ?? []).map(a => new PedidoItemAdicional(a.nome, a.preco)),
    ));
    const pedido = new Pedido(
      randomUUID(), 0,
      input.mesa, input.observacoes ?? null, 'RECEBIDO', itens
    );
    return this.repo.create(pedido);
  }
}
