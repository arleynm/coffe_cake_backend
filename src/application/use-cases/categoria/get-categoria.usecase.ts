import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaCardapioRepository } from '../../../domain/cardapio/categoria.repository';
import { CategoriaCardapioEntity } from '../../../domain/cardapio/categoria.entity';

@Injectable()
export class GetCategoriaUseCase {
  constructor(
    @Inject(CategoriaCardapioRepository)
    private readonly repo: CategoriaCardapioRepository,
  ) {}

  async exec(id: string): Promise<CategoriaCardapioEntity> {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException('Categoria não encontrada');
    return c;
  }
}
