import { MovimentoEstoque } from '../entities/movimento.entity';
import { TipoMovimento } from '../value-objects/tipo-movimento.vo';

export abstract class MovimentoRepository {
  // saldo atual (na unidade base) por insumo/deposito e, opcionalmente, por lote
  abstract getSaldo(params: { insumoId: string; depositoId: string; loteId?: string | null }): Promise<number>;

  abstract entrada(data: {
    insumoId: string; depositoId: string; quantidadeBase: number;
    loteId?: string | null; custoUnitario?: string | null; documentoRef?: string | null; observacao?: string | null;
  }): Promise<MovimentoEstoque>;

  abstract saida(data: {
    insumoId: string; depositoId: string; quantidadeBase: number;
    loteId?: string | null; documentoRef?: string | null; observacao?: string | null;
  }): Promise<MovimentoEstoque>;

  abstract ajuste(data: {
    tipo: Extract<TipoMovimento, 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO'>;
    insumoId: string; depositoId: string; quantidadeBase: number;
    loteId?: string | null; documentoRef?: string | null; observacao?: string | null;
  }): Promise<MovimentoEstoque>;

  abstract transferir(data: {
    insumoId: string; quantidadeBase: number;
    depositoOrigemId: string; depositoDestinoId: string;
    loteId?: string | null; documentoRef?: string | null; observacao?: string | null;
  }): Promise<{ saidaId: string; entradaId: string }>;
}
