import { BadRequestException, Injectable } from '@nestjs/common';
import { MovimentoRepository } from '../../../domain/estoque/repositories/movimento.repository';
import { MovimentoEstoque } from '../../../domain/estoque/entities/movimento.entity';

@Injectable()
export class AjusteUseCase {
  constructor(private repo: MovimentoRepository) {}

  async execute(input: {
    tipo: 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO';
    insumoId: string; depositoId: string; quantidadeBase: number;
    loteId?: string | null; documentoRef?: string | null; observacao?: string | null;
    allowNegative?: boolean;
  }): Promise<MovimentoEstoque> {
    if (!(input.quantidadeBase > 0)) throw new BadRequestException('quantidadeBase deve ser maior que zero.');
    if (input.tipo === 'AJUSTE_NEGATIVO' && !input.allowNegative) {
      const saldo = await this.repo.getSaldo({
        insumoId: input.insumoId,
        depositoId: input.depositoId,
        loteId: input.loteId ?? undefined,
      });
      if (saldo < input.quantidadeBase) {
        throw new BadRequestException(`Saldo insuficiente para ajuste negativo: saldo=${saldo}, ajuste=${input.quantidadeBase}`);
      }
    }
    return this.repo.ajuste(input);
  }
}
