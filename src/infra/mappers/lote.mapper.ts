import { Prisma, Lote as PrismaLote } from '@prisma/client';
import { Lote } from '../../domain/estoque/entities/lote.entity';

export class LoteMapper {
  static toDomain(p: PrismaLote): Lote {
    return new Lote(p.id, p.insumoId, p.depositoId, p.codigo, p.validade ?? null, p.createdAt, p.updatedAt);
  }

  static toPrismaCreate(data: {
    insumoId: string;
    depositoId: string;
    codigo?: string | null;
    validade?: Date | null;
  }): Prisma.LoteUncheckedCreateInput {
    return {
      insumoId: data.insumoId,
      depositoId: data.depositoId,
      codigo: data.codigo ?? null,
      validade: data.validade ?? null,
    };
  }

  static toPrismaUpdate(data: { codigo?: string | null; validade?: Date | null }): Prisma.LoteUncheckedUpdateInput {
    const out: Prisma.LoteUncheckedUpdateInput = {};
    if (data.codigo !== undefined) out.codigo = data.codigo;
    if (data.validade !== undefined) out.validade = data.validade;
    return out;
  }
}
