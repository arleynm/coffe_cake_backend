import { Unidade as PrismaUnidade, Prisma } from '@prisma/client';
import { Unidade } from '../../domain/estoque/entities/unidade.entity'; // ajuste se estiver em domain/estoque

export class UnidadeMapper {
  static toDomain(p: PrismaUnidade): Unidade {
    return new Unidade(p.id, p.codigo, p.nome, p.fatorBase);
  }

  static toPrismaCreate(data: { codigo: string; nome: string; fatorBase: number }): Prisma.UnidadeCreateInput {
    return { codigo: data.codigo, nome: data.nome, fatorBase: data.fatorBase };
  }

  static toPrismaUpdate(data: Partial<{ codigo: string; nome: string; fatorBase: number }>): Prisma.UnidadeUncheckedUpdateInput {
    const out: Prisma.UnidadeUncheckedUpdateInput = {};
    if (data.codigo !== undefined) out.codigo = data.codigo;
    if (data.nome !== undefined) out.nome = data.nome;
    if (data.fatorBase !== undefined) out.fatorBase = data.fatorBase;
    return out;
  }
}
