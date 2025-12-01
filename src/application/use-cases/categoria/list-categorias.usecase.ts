import { Inject, Injectable } from '@nestjs/common';
import { CategoriaCardapioRepository } from '../../../domain/cardapio/categoria.repository';

@Injectable()
export class ListCategoriasUseCase {
  constructor(
    @Inject(CategoriaCardapioRepository)
    private readonly repo: CategoriaCardapioRepository,
  ) {}

  async exec(params: {
    q?: string; ativo?: boolean; page?: number; pageSize?: number;
    orderBy?: 'nome'|'ordem'|'createdAt'|'updatedAt'; orderDir?: 'asc'|'desc';
  }) {
    return this.repo.list(params);
  }
}
