import { Injectable, NotFoundException } from '@nestjs/common';
import { DepositoRepository } from '../../../domain/estoque/repositories/deposito.repository';
import { Deposito } from '../../../domain/estoque/entities/deposito.entity';

@Injectable()
export class GetDepositoUseCase {
  constructor(private repo: DepositoRepository) {}
  async execute(id: string): Promise<Deposito> {
    const d = await this.repo.findById(id);
    if (!d) throw new NotFoundException('Depósito não encontrado.');
    return d;
  }
}
