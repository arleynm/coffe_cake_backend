import { BadRequestException, Injectable } from '@nestjs/common';
import { MovimentoRepository } from '../../../domain/estoque/repositories/movimento.repository';

@Injectable()
export class TransferenciaUseCase {
  constructor(private repo: MovimentoRepository) {}

  async execute(input: {
    insumoId: string; quantidadeBase: number;
    depositoOrigemId: string; depositoDestinoId: string;
    loteId?: string | null; documentoRef?: string | null; observacao?: string | null;
    allowNegative?: boolean;
  }) {
    if (input.depositoOrigemId === input.depositoDestinoId) {
      throw new BadRequestException('Depósitos de origem e destino devem ser diferentes.');
    }
    if (!(input.quantidadeBase > 0)) throw new BadRequestException('quantidadeBase deve ser maior que zero.');

    if (!input.allowNegative) {
      const saldo = await this.repo.getSaldo({
        insumoId: input.insumoId,
        depositoId: input.depositoOrigemId,
        loteId: input.loteId ?? undefined,
      });
      if (saldo < input.quantidadeBase) {
        throw new BadRequestException(`Saldo insuficiente no depósito de origem: saldo=${saldo}, transferência=${input.quantidadeBase}`);
      }
    }

    return this.repo.transferir(input);
  }
}
