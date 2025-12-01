import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InsumoRepository } from '../../../domain/estoque/repositories/insumo.repository';
import { Insumo } from '../../../domain/estoque/entities/insumo.entity';

@Injectable()
export class UpdateInsumoUseCase {
  constructor(private repo: InsumoRepository) {}

  async execute(id: string, input: Partial<Omit<Insumo, 'id'>>): Promise<Insumo> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException('Insumo não encontrado.');

    if (input.nome !== undefined) {
      const nome = input.nome.trim();
      if (!nome) throw new BadRequestException('Nome não pode ser vazio.');
      input.nome = nome;
    }

    if (input.sku !== undefined && input.sku !== current.sku) {
      if (input.sku) {
        const dup = await this.repo.findBySku(input.sku);
        if (dup && dup.id !== id) throw new BadRequestException('SKU já cadastrado.');
      }
    }

    return this.repo.update(id, input);
  }
}
