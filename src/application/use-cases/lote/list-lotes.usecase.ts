import { Injectable } from '@nestjs/common';
import { LoteRepository, ListLotesFilter } from '../../../domain/estoque/repositories/lote.repository';
import { Lote } from '../../../domain/estoque/entities/lote.entity';

@Injectable()
export class ListLotesUseCase {
  constructor(private repo: LoteRepository) {}
  execute(filter?: ListLotesFilter): Promise<Lote[]> {
    return this.repo.findMany(filter);
  }
}
