import { Inject, Injectable } from '@nestjs/common';
import { CategoriaCardapioRepository } from '../../../domain/cardapio/categoria.repository';

@Injectable()
export class DeleteCategoriaUseCase {
  constructor(
    @Inject(CategoriaCardapioRepository)
    private readonly repo: CategoriaCardapioRepository,
  ) {}

  async exec(id: string) {
    await this.repo.delete(id);
  }
}
