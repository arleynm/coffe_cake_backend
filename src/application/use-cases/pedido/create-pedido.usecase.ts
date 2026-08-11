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
      input.mesa, input.observacoes ?? null, 'RECEBIDO', itens,
      new Date(), new Date(), null,
      input.tipoAtendimento ?? 'LOCAL', input.clienteNome ?? null, input.clienteTelefone ?? null,
      input.deliveryZoneId ?? null, input.enderecoCep ?? null, input.enderecoRua ?? null,
      input.enderecoNumero ?? null, input.enderecoBairro ?? null, input.enderecoCidade ?? null,
      input.enderecoUf ?? null, input.enderecoComplemento ?? null, input.taxaEntrega ?? 0,
      input.entregaLatitude ?? null, input.entregaLongitude ?? null, input.entregaPrevistaEm ?? null,
    );
    return this.repo.create(pedido);
  }
}
