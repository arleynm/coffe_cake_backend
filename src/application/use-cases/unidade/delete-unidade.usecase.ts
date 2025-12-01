import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UnidadeRepository } from '../../../domain/estoque/repositories/unidade.repository';

@Injectable()
export class DeleteUnidadeUseCase {
  constructor(private repo: UnidadeRepository) {}

  async execute(id: string): Promise<void> {
    const current = await this.repo.findById(id);
    if (!current) throw new NotFoundException('Unidade não encontrada.');

    try {
      await this.repo.delete(id);
    } catch (e: any) {
      // ex.: FK constraint se houver Insumos usando a unidade
      throw new BadRequestException('Não é possível excluir a unidade porque está em uso.');
    }
  }
}
