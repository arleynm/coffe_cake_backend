import { CategoriaCardapioEntity } from './categoria.entity';

export abstract class CategoriaCardapioRepository {
  abstract create(data: Omit<CategoriaCardapioEntity, 'id'|'createdAt'|'updatedAt'>): Promise<CategoriaCardapioEntity>;
  abstract update(id: string, patch: Partial<Omit<CategoriaCardapioEntity, 'id'|'createdAt'|'updatedAt'>>): Promise<CategoriaCardapioEntity>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<CategoriaCardapioEntity | null>;
  abstract findBySlug(slug: string): Promise<CategoriaCardapioEntity | null>;
  abstract list(params: {
    q?: string;
    ativo?: boolean;
    page?: number;
    pageSize?: number;
    orderBy?: 'nome'|'ordem'|'createdAt'|'updatedAt';
    orderDir?: 'asc'|'desc';
  }): Promise<{ items: CategoriaCardapioEntity[]; total: number }>;
}
