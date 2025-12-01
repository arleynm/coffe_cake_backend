import { Injectable } from '@nestjs/common';
import { DepositoRepository } from '../../../domain/estoque/repositories/deposito.repository';
import { Deposito } from '../../../domain/estoque/entities/deposito.entity';

@Injectable()
export class ListDepositosUseCase {
  constructor(private repo: DepositoRepository) {}
  async execute(input?: { onlyActive?: boolean }): Promise<Deposito[]> {
    const list = await this.repo.findAll();
    return input?.onlyActive ? list.filter(d => d.ativo) : list;
  }
}
