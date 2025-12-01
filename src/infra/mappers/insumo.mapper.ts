import { Prisma, Insumo as PrismaInsumo } from '@prisma/client';
import { Insumo } from '../../domain/estoque/entities/insumo.entity';

export class InsumoMapper {
  static toDomain(p: PrismaInsumo): Insumo {
    return new Insumo(
      p.id, p.nome, p.unidadeBaseId, p.sku, p.ativo, p.estoqueMinimo,
      p.createdAt, p.updatedAt,
    );
  }

  static toPrismaCreate(data: {
    nome: string; unidadeBaseId: string; sku?: string | null; estoqueMinimo?: number | null; ativo?: boolean;
  }): Prisma.InsumoUncheckedCreateInput {
    return {
      nome: data.nome.trim(),
      unidadeBaseId: data.unidadeBaseId,
      sku: data.sku ?? null,
      estoqueMinimo: data.estoqueMinimo ?? null,
      ativo: data.ativo ?? true,
    };
  }

  static toPrismaUpdate(data: Partial<{
    nome: string; unidadeBaseId: string; sku: string | null; estoqueMinimo: number | null; ativo: boolean;
  }>): Prisma.InsumoUncheckedUpdateInput {
    const out: Prisma.InsumoUncheckedUpdateInput = {};
    if (data.nome !== undefined) out.nome = data.nome.trim();
    if (data.unidadeBaseId !== undefined) out.unidadeBaseId = data.unidadeBaseId;
    if (data.sku !== undefined) out.sku = data.sku;
    if (data.estoqueMinimo !== undefined) out.estoqueMinimo = data.estoqueMinimo;
    if (data.ativo !== undefined) out.ativo = data.ativo;
    return out;
  }
}
