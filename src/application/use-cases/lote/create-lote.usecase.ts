import { BadRequestException, Injectable } from '@nestjs/common';
import { LoteRepository } from '../../../domain/estoque/repositories/lote.repository';
import { Lote } from '../../../domain/estoque/entities/lote.entity';

@Injectable()
export class CreateLoteUseCase {
  constructor(private repo: LoteRepository) {}

  async execute(input: {
    insumoId: string;
    depositoId: string;
    codigo?: string | null;
    validade?: string | Date | null;
  }): Promise<Lote> {
    if (!input.insumoId) throw new BadRequestException('insumoId é obrigatório.');
    if (!input.depositoId) throw new BadRequestException('depositoId é obrigatório.');

    const validade =
      typeof input.validade === 'string' ? new Date(input.validade) : input.validade ?? null;

    return this.repo.create({
      insumoId: input.insumoId,
      depositoId: input.depositoId,
      codigo: input.codigo ?? null,
      validade,
    });
  }
}
