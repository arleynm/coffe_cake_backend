import { Injectable } from '@nestjs/common';
import { Unidade } from '../../../domain/estoque/entities/unidade.entity';
import { UnidadeRepository } from '../../../domain/estoque/repositories/unidade.repository';

@Injectable()
export class ListUnidadesUseCase {
  constructor(private repo: UnidadeRepository) {}
  execute(): Promise<Unidade[]> {
    return this.repo.findAll();
  }
}
