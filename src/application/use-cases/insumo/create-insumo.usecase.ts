import { BadRequestException, Injectable } from '@nestjs/common';
import { InsumoRepository } from '../../../domain/estoque/repositories/insumo.repository';
import { Insumo } from '../../../domain/estoque/entities/insumo.entity';

@Injectable()
export class CreateInsumoUseCase {
  constructor(private repo: InsumoRepository) {}

  async execute(input: {
    nome: string;
    unidadeBaseId: string;
    sku?: string | null;
    estoqueMinimo?: number | null;
    ativo?: boolean;
  }): Promise<Insumo> {
    const nome = input.nome?.trim();
    if (!nome) throw new BadRequestException('Nome é obrigatório.');

    if (input.sku) {
      const dup = await this.repo.findBySku(input.sku);
      if (dup) throw new BadRequestException('SKU já cadastrado.');
    }

    return this.repo.create({
      nome,
      unidadeBaseId: input.unidadeBaseId,
      sku: input.sku ?? null,
      estoqueMinimo: input.estoqueMinimo ?? null,
      ativo: input.ativo ?? true,
    });
  }
}
