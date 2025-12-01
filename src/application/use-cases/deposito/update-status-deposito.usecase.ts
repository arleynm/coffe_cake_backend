import { Injectable, NotFoundException } from '@nestjs/common';
import { DepositoRepository } from '../../../domain/estoque/repositories/deposito.repository';
import { Deposito } from '../../../domain/estoque/entities/deposito.entity';

@Injectable()
export class UpdateStatusDepositoUseCase {
  constructor(private repo: DepositoRepository) {}
  async execute(id: string, ativo: boolean): Promise<Deposito> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException('Depósito não encontrado.');
    return this.repo.update(id, { ativo });
  }
}
