import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { MovimentoRepository } from '../../../domain/estoque/repositories/movimento.repository';
import { MovimentoEstoque } from '../../../domain/estoque/entities/movimento.entity';
import { TipoMovimento } from '../../../domain/estoque/value-objects/tipo-movimento.vo';
import { Prisma, TipoMovimento as TipoMovPrisma } from '@prisma/client';

@Injectable()
export class PrismaMovimentoRepository implements MovimentoRepository {
  constructor(private prisma: PrismaService) {}

  // -------- helpers
  private toEntity(m: any): MovimentoEstoque {
    return new MovimentoEstoque(
      m.id, m.insumoId, m.depositoId, m.tipo as TipoMovimento, m.quantidadeBase,
      m.loteId ?? null, m.custoUnitario?.toString() ?? null, m.documentoRef ?? null, m.observacao ?? null, m.createdAt,
    );
  }

  private async create(data: {
    insumoId: string; depositoId: string; tipo: TipoMovimento; quantidadeBase: number;
    loteId?: string | null; custoUnitario?: string | null; documentoRef?: string | null; observacao?: string | null;
  }): Promise<MovimentoEstoque> {
    const created = await this.prisma.movimentoEstoque.create({
      data: {
        insumoId: data.insumoId,
        depositoId: data.depositoId,
        tipo: data.tipo as TipoMovPrisma,
        quantidadeBase: data.quantidadeBase,
        loteId: data.loteId ?? null,
        custoUnitario: data.custoUnitario != null ? new Prisma.Decimal(data.custoUnitario) : null,
        documentoRef: data.documentoRef ?? null,
        observacao: data.observacao ?? null,
      },
    });
    return this.toEntity(created);
  }

  // -------- leitura de saldo
  async getSaldo(params: { insumoId: string; depositoId: string; loteId?: string | null }): Promise<number> {
    const whereBase: Prisma.MovimentoEstoqueWhereInput = {
      insumoId: params.insumoId,
      depositoId: params.depositoId,
    };
    if (params.loteId) whereBase.loteId = params.loteId;

    const positivos: TipoMovPrisma[] = ['ENTRADA', 'AJUSTE_POSITIVO', 'TRANSFERENCIA_ENTRADA', 'PRODUCAO_GERACAO'];
    const negativos: TipoMovPrisma[] = ['SAIDA', 'AJUSTE_NEGATIVO', 'TRANSFERENCIA_SAIDA', 'PERDA', 'PRODUCAO_CONSUMO'];

    const pos = await this.prisma.movimentoEstoque.aggregate({
      where: { ...whereBase, tipo: { in: positivos } },
      _sum: { quantidadeBase: true },
    });
    const neg = await this.prisma.movimentoEstoque.aggregate({
      where: { ...whereBase, tipo: { in: negativos } },
      _sum: { quantidadeBase: true },
    });

    const sPos = pos._sum.quantidadeBase ?? 0;
    const sNeg = neg._sum.quantidadeBase ?? 0;
    return sPos - sNeg;
  }

  // -------- gravação
  entrada(d: any) { return this.create({ ...d, tipo: 'ENTRADA' }); }

  saida(d: any)   { return this.create({ ...d, tipo: 'SAIDA' }); }

  ajuste(d: { tipo: 'AJUSTE_POSITIVO' | 'AJUSTE_NEGATIVO' } & any) {
    return this.create({ ...d, tipo: d.tipo });
  }

  async transferir(d: {
    insumoId: string; quantidadeBase: number; loteId?: string | null;
    depositoOrigemId: string; depositoDestinoId: string; documentoRef?: string | null; observacao?: string | null;
  }): Promise<{ saidaId: string; entradaId: string }> {
    if (d.depositoOrigemId === d.depositoDestinoId) {
      throw new BadRequestException('Depósitos de origem e destino devem ser diferentes.');
    }

    const res = await this.prisma.$transaction(async (tx) => {
      const saida = await tx.movimentoEstoque.create({
        data: {
          insumoId: d.insumoId,
          depositoId: d.depositoOrigemId,
          tipo: 'TRANSFERENCIA_SAIDA',
          quantidadeBase: d.quantidadeBase,
          loteId: d.loteId ?? null,
          documentoRef: d.documentoRef ?? null,
          observacao: d.observacao ?? null,
        },
      });
      const entrada = await tx.movimentoEstoque.create({
        data: {
          insumoId: d.insumoId,
          depositoId: d.depositoDestinoId,
          tipo: 'TRANSFERENCIA_ENTRADA',
          quantidadeBase: d.quantidadeBase,
          loteId: d.loteId ?? null,
          documentoRef: d.documentoRef ?? null,
          observacao: d.observacao ?? null,
        },
      });
      return { saidaId: saida.id, entradaId: entrada.id };
    });

    return res;
  }
}
