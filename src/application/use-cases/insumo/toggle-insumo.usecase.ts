import { Injectable, NotFoundException } from '@nestjs/common';
import { InsumoRepository } from '../../../domain/estoque/repositories/insumo.repository';
import { Insumo } from '../../../domain/estoque/entities/insumo.entity';

@Injectable()
export class ToggleInsumoUseCase {
  constructor(private repo: InsumoRepository) {}

  async execute(id: string, ativo: boolean): Promise<Insumo> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException('Insumo não encontrado.');
    return this.repo.toggleActive(id, ativo);
  }
}
