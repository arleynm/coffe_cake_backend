import { MovimentoEstoque as PrismaMovimento, Prisma } from '@prisma/client';
import { MovimentoEstoque } from '../../domain/estoque/entities/movimento.entity'; // ajuste se estiver em domain/estoque
import { TipoMovimento } from '../../domain/estoque/value-objects/tipo-movimento.vo';

export class MovimentoMapper {
  static toDomain(p: PrismaMovimento): MovimentoEstoque {
    return new MovimentoEstoque(
      p.id,
      p.insumoId,
      p.depositoId,
      p.tipo as TipoMovimento,
      p.quantidadeBase,
      p.loteId ?? null,
      p.custoUnitario ? p.custoUnitario.toString() : null,
      p.documentoRef ?? null,
      p.observacao ?? null,
      p.createdAt,
    );
  }

  static toPrismaCreate(data: {
    insumoId: string;
    depositoId: string;
    tipo: TipoMovimento;
    quantidadeBase: number;
    loteId?: string | null;
    custoUnitario?: string | null;     // string para Decimal
    documentoRef?: string | null;
    observacao?: string | null;
  }): Prisma.MovimentoEstoqueUncheckedCreateInput {
    return {
      insumoId: data.insumoId,
      depositoId: data.depositoId,
      tipo: data.tipo,
      quantidadeBase: data.quantidadeBase,
      loteId: data.loteId ?? null,
      custoUnitario: data.custoUnitario != null ? new Prisma.Decimal(data.custoUnitario) : null,
      documentoRef: data.documentoRef ?? null,
      observacao: data.observacao ?? null,
      // createdAt: será default(now()) no banco
    };
  }
}
