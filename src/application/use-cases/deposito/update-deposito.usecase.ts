import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DepositoRepository } from '../../../domain/estoque/repositories/deposito.repository';
import { Deposito } from '../../../domain/estoque/entities/deposito.entity';

@Injectable()
export class UpdateDepositoUseCase {
  constructor(private repo: DepositoRepository) {}

  async execute(id: string, input: { nome?: string; ativo?: boolean }): Promise<Deposito> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException('Depósito não encontrado.');

    if (input.nome) {
      const nome = input.nome.trim();
      if (!nome) throw new BadRequestException('Nome não pode ser vazio.');
      const dup = await this.repo.findByNome(nome);
      if (dup && dup.id !== id) throw new BadRequestException('Já existe um depósito com esse nome.');
      input.nome = nome;
    }
    return this.repo.update(id, input);
  }
}
