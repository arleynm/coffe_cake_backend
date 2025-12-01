import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CategoriaCardapioRepository } from '../../../domain/cardapio/categoria.repository';
import { CategoriaCardapioEntity } from '../../../domain/cardapio/categoria.entity';
import { slugify } from './slug.util';

type Input = { id: string; patch: Partial<Pick<CategoriaCardapioEntity, 'nome'|'slug'|'ordem'|'ativo'>> };

@Injectable()
export class UpdateCategoriaUseCase {
  constructor(
    @Inject(CategoriaCardapioRepository)
    private readonly repo: CategoriaCardapioRepository,
  ) {}

  async exec({ id, patch }: Input): Promise<CategoriaCardapioEntity> {
    const found = await this.repo.findById(id);
    if (!found) throw new NotFoundException('Categoria não encontrada');

    const update: any = { ...patch };

    if (patch?.nome) {
      update.nome = patch.nome.trim();
      if (!patch.slug) update.slug = slugify(update.nome);
    }
    if (patch?.slug) {
      update.slug = slugify(patch.slug);
      const exists = await this.repo.findBySlug(update.slug);
      if (exists && exists.id !== id) throw new BadRequestException('slug já existe');
    }

    return this.repo.update(id, update);
  }
}
