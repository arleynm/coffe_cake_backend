import { Lote } from '../entities/lote.entity';

export type ListLotesFilter = {
  insumoId?: string;
  depositoId?: string;
  vencendoAte?: Date; // exemplo: hoje + 7 dias
};

export abstract class LoteRepository {
  abstract create(data: {
    insumoId: string;
    depositoId: string;
    codigo?: string | null;
    validade?: Date | null;
  }): Promise<Lote>;

  // Atualiza apenas metadados (codigo/validade). Para mudar depósito, use transferência.
  abstract update(id: string, data: { codigo?: string | null; validade?: Date | null }): Promise<Lote>;

  abstract findById(id: string): Promise<Lote | null>;
  abstract findMany(filter?: ListLotesFilter): Promise<Lote[]>;
}
