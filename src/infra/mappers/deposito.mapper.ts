import { Deposito as PrismaDeposito, Prisma } from '@prisma/client';
import { Deposito } from '../../domain/estoque/entities/deposito.entity';

export class DepositoMapper {
  static toDomain(p: PrismaDeposito): Deposito {
    return new Deposito(p.id, p.nome, p.ativo, p.createdAt, p.updatedAt);
  }

  static toPrismaCreate(data: { nome: string; ativo?: boolean }): Prisma.DepositoCreateInput {
    return { nome: data.nome.trim(), ativo: data.ativo ?? true };
  }

  static toPrismaUpdate(data: { nome?: string; ativo?: boolean }): Prisma.DepositoUncheckedUpdateInput {
    const out: Prisma.DepositoUncheckedUpdateInput = {};
    if (data.nome !== undefined) out.nome = data.nome.trim();
    if (data.ativo !== undefined) out.ativo = data.ativo;
    return out;
  }
}
