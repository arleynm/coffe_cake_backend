import { PedidoStatus, Tamanho } from '../../../domain/pedido/pedido.entity';

export type CreatePedidoDTO = {
  mesa: string;
  observacoes?: string | null;
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
