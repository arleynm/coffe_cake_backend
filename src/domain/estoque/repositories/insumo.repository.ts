import { Insumo } from '../entities/insumo.entity';

export type ListInsumosFilter = {
  search?: string;       
  onlyActive?: boolean;  
};

export abstract class InsumoRepository {
  abstract create(data: {
    nome: string;
    unidadeBaseId: string;
    sku?: string | null;
    estoqueMinimo?: number | null;
    ativo?: boolean;
  }): Promise<Insumo>;

  abstract update(id: string, data: Partial<Omit<Insumo, 'id'>>): Promise<Insumo>;

  abstract findAll(filter?: ListInsumosFilter): Promise<Insumo[]>;
  abstract findById(id: string): Promise<Insumo | null>;
  abstract findBySku(sku: string): Promise<Insumo | null>;
  abstract toggleActive(id: string, ativo: boolean): Promise<Insumo>;
}
