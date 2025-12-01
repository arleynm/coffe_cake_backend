import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CategoriaCardapioRepository } from '../../../domain/cardapio/categoria.repository';
import { CategoriaCardapioEntity } from '../../../domain/cardapio/categoria.entity';
import { slugify } from './slug.util';

type Input = { nome: string; slug?: string; ordem?: number; ativo?: boolean };

@Injectable()
export class CreateCategoriaUseCase {
  constructor(
    @Inject(CategoriaCardapioRepository)
    private readonly repo: CategoriaCardapioRepository,
  ) {}

  async exec(input: Input): Promise<CategoriaCardapioEntity> {
    const nome = input.nome?.trim();
    if (!nome) throw new BadRequestException('nome é obrigatório');

    const slug = (input.slug?.trim() || slugify(nome));
    const exists = await this.repo.findBySlug(slug);
    if (exists) throw new BadRequestException('slug já existe');

    return this.repo.create({
      nome,
      slug,
      ordem: input.ordem ?? 0,
      ativo: input.ativo ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  }
}
