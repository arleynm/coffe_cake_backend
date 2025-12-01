import { Produto } from './produto.entity';

export abstract class ProdutoRepository {
  abstract create(
    data: Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Produto>;

  abstract update(
    id: string,
    data: Partial<Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Produto>;

  abstract delete(id: string): Promise<void>;

  abstract findById(id: string): Promise<Produto | null>;

  abstract list(params: {
    q?: string;
    categoriaId?: string;
    ativo?: boolean;
    exibirNoCardapio?: boolean;
    page?: number;
    pageSize?: number;
    orderBy?: 'nome' | 'createdAt' | 'updatedAt' | 'precoVenda';
    orderDir?: 'asc' | 'desc';
  }): Promise<{ items: Produto[]; total: number }>;
}
