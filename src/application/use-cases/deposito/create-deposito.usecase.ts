import { BadRequestException, Injectable } from '@nestjs/common';
import { DepositoRepository } from '../../../domain/estoque/repositories/deposito.repository';
import { Deposito } from '../../../domain/estoque/entities/deposito.entity';

@Injectable()
export class CreateDepositoUseCase {
  constructor(private repo: DepositoRepository) {}

  async execute(input: { nome: string; ativo?: boolean }): Promise<Deposito> {
    const nome = input.nome.trim();
    if (!nome) throw new BadRequestException('Nome é obrigatório.');

    const dup = await this.repo.findByNome(nome);
    if (dup) throw new BadRequestException('Já existe um depósito com esse nome.');

    return this.repo.create({ nome, ativo: input.ativo ?? true });
  }
}
