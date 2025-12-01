import { Injectable } from '@nestjs/common';
import { InsumoRepository, ListInsumosFilter } from '../../../domain/estoque/repositories/insumo.repository';
import { Insumo } from '../../../domain/estoque/entities/insumo.entity';

@Injectable()
export class ListInsumosUseCase {
  constructor(private repo: InsumoRepository) {}

  execute(filter?: ListInsumosFilter): Promise<Insumo[]> {
    return this.repo.findAll(filter);
  }
}
