import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoteRepository } from '../../../domain/estoque/repositories/lote.repository';
import { Lote } from '../../../domain/estoque/entities/lote.entity';

@Injectable()
export class UpdateLoteUseCase {
  constructor(private repo: LoteRepository) {}

  async execute(id: string, input: { codigo?: string | null; validade?: string | Date | null }): Promise<Lote> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException('Lote não encontrado.');

    const payload: { codigo?: string | null; validade?: Date | null } = {};
    if (input.codigo !== undefined) payload.codigo = input.codigo?.trim() ?? null;
    if (input.validade !== undefined) {
      payload.validade = typeof input.validade === 'string' ? new Date(input.validade) : input.validade;
    }

    // Não permitir alterar depósito por aqui
    return this.repo.update(id, payload);
  }
}
