import { PedidoStatus, Tamanho } from '../../../domain/pedido/pedido.entity';

export type CreatePedidoDTO = {
  mesa: string;
  observacoes?: string | null;
  tipoAtendimento?: 'LOCAL'|'RETIRADA'|'ENTREGA';
  clienteNome?: string | null;
  clienteTelefone?: string | null;
  deliveryZoneId?: string | null;
  enderecoCep?: string | null;
  enderecoRua?: string | null;
  enderecoNumero?: string | null;
  enderecoBairro?: string | null;
  enderecoCidade?: string | null;
  enderecoUf?: string | null;
  enderecoComplemento?: string | null;
  taxaEntrega?: number;
  entregaLatitude?: number | null;
  entregaLongitude?: number | null;
  entregaPrevistaEm?: Date | null;
  itens: Array<{
    produtoId?: string | null;
    nome: string;
    tamanho?: Tamanho | null;
    quantidade: number;
    precoUnit: number;
    obs?: string | null;
    adicionais?: Array<{ nome: string; preco: number }>;
  }>;
};

export type UpdatePedidoDTO = Partial<Omit<CreatePedidoDTO,'itens'>> & {
  itens?: CreatePedidoDTO['itens'];
};

export type ChangeStatusDTO = { id: string; status: PedidoStatus };
