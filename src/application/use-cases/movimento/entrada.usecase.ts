import { BadRequestException, Injectable } from '@nestjs/common';
import { MovimentoRepository } from '../../../domain/estoque/repositories/movimento.repository';
import { MovimentoEstoque } from '../../../domain/estoque/entities/movimento.entity';

@Injectable()
export class EntradaUseCase {
  constructor(private repo: MovimentoRepository) {}

  async execute(input: {
    insumoId: string; depositoId: string; quantidadeBase: number;
    loteId?: string | null; custoUnitario?: string | null; documentoRef?: string | null; observacao?: string | null;
  }): Promise<MovimentoEstoque> {
    if (!input.insumoId || !input.depositoId) throw new BadRequestException('insumoId e depositoId são obrigatórios.');
    if (!(input.quantidadeBase > 0)) throw new BadRequestException('quantidadeBase deve ser maior que zero.');
    return this.repo.entrada(input);
  }
}
