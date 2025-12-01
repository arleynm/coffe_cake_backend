import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Unidade } from '../../../domain/estoque/entities/unidade.entity';
import { UnidadeRepository } from '../../../domain/estoque/repositories/unidade.repository';

@Injectable()
export class UpdateUnidadeUseCase {
  constructor(private repo: UnidadeRepository) {}

  async execute(
    id: string,
    input: Partial<Pick<Unidade, 'codigo' | 'nome' | 'fatorBase'>>
  ): Promise<Unidade> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException('Unidade não encontrada.');

    const patch: Partial<Pick<Unidade, 'codigo' | 'nome' | 'fatorBase'>> = {};

    if (input.codigo !== undefined) {
      const codigo = input.codigo.trim();
      if (!codigo) throw new BadRequestException('Código não pode ser vazio.');
      const dup = await this.repo.findByCodigo(codigo);
      if (dup && dup.id !== id) {
        throw new BadRequestException('Já existe uma unidade com esse código.');
      }
      patch.codigo = codigo;
    }

    if (input.nome !== undefined) {
      const nome = input.nome.trim();
      if (!nome) throw new BadRequestException('Nome não pode ser vazio.');
      patch.nome = nome;
    }

    if (input.fatorBase !== undefined) {
      if (!(input.fatorBase > 0)) throw new BadRequestException('fatorBase deve ser > 0.');
      patch.fatorBase = input.fatorBase;
    }

    return this.repo.update(id, patch);
  }
}
