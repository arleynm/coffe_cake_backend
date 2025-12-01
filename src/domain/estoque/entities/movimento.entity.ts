// src/domain/estoque/entities/movimento.entity.ts
import { TipoMovimento } from '../value-objects/tipo-movimento.vo';

export class MovimentoEstoque {
  constructor(
    public readonly id: string,
    public insumoId: string,
    public depositoId: string,
    public tipo: TipoMovimento,
    public quantidadeBase: number,        // sempre positiva; o sinal é dado por "tipo"
    public loteId?: string | null,
    public custoUnitario?: string | null, // usar string para Decimal do Prisma
    public documentoRef?: string | null,
    public observacao?: string | null,
    public readonly createdAt?: Date,
  ) {
    if (!insumoId) throw new Error('insumoId é obrigatório.');
    if (!depositoId) throw new Error('depositoId é obrigatório.');
    if (!tipo) throw new Error('tipo é obrigatório.');
    if (!(quantidadeBase > 0)) throw new Error('quantidadeBase deve ser maior que zero.');
  }
}
