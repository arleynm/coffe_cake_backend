import { BadRequestException, Injectable } from '@nestjs/common';
import { Unidade } from '../../../domain/estoque/entities/unidade.entity';
import { UnidadeRepository } from '../../../domain/estoque/repositories/unidade.repository';

@Injectable()
export class CreateUnidadeUseCase {
  constructor(private repo: UnidadeRepository) {}

  async execute(input: { codigo: string; nome: string; fatorBase: number }): Promise<Unidade> {
    const codigo = input.codigo?.trim();
    const nome   = input.nome?.trim();

    if (!codigo) throw new BadRequestException('Código é obrigatório.');
    if (!nome)   throw new BadRequestException('Nome é obrigatório.');
    if (!(input.fatorBase > 0)) throw new BadRequestException('fatorBase deve ser > 0.');

    const dup = await this.repo.findByCodigo(codigo);
    if (dup) throw new BadRequestException('Já existe uma unidade com esse código.');

    return this.repo.create({ codigo, nome, fatorBase: input.fatorBase });
  }
}
