import { BadRequestException, Injectable } from '@nestjs/common';
import { MovimentoRepository } from '../../../domain/estoque/repositories/movimento.repository';
import { MovimentoEstoque } from '../../../domain/estoque/entities/movimento.entity';

@Injectable()
export class SaidaUseCase {
  constructor(private repo: MovimentoRepository) {}

  async execute(input: {
    insumoId: string; depositoId: string; quantidadeBase: number;
    loteId?: string | null; documentoRef?: string | null; observacao?: string | null;
    allowNegative?: boolean;
  }): Promise<MovimentoEstoque> {
    if (!input.insumoId || !input.depositoId) throw new BadRequestException('insumoId e depositoId são obrigatórios.');
    if (!(input.quantidadeBase > 0)) throw new BadRequestException('quantidadeBase deve ser maior que zero.');

    if (!input.allowNegative) {
      const saldo = await this.repo.getSaldo({
        insumoId: input.insumoId,
        depositoId: input.depositoId,
        loteId: input.loteId ?? undefined,
      });
      if (saldo < input.quantidadeBase) {
        throw new BadRequestException(`Saldo insuficiente: saldo=${saldo}, solicitado=${input.quantidadeBase}`);
      }
    }

    return this.repo.saida(input);
  }
}
