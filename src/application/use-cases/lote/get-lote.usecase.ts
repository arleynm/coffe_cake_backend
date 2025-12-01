import { Injectable, NotFoundException } from '@nestjs/common';
import { LoteRepository } from '../../../domain/estoque/repositories/lote.repository';
import { Lote } from '../../../domain/estoque/entities/lote.entity';

@Injectable()
export class GetLoteUseCase {
  constructor(private repo: LoteRepository) {}
  async execute(id: string): Promise<Lote> {
    const l = await this.repo.findById(id);
    if (!l) throw new NotFoundException('Lote não encontrado.');
    return l;
  }
}
