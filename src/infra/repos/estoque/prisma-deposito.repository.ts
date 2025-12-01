import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { DepositoRepository } from '../../../domain/estoque/repositories/deposito.repository';
import { Deposito } from '../../../domain/estoque/entities/deposito.entity';

@Injectable()
export class PrismaDepositoRepository implements DepositoRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { nome: string; ativo?: boolean }): Promise<Deposito> {
    const d = await this.prisma.deposito.create({ data });
    return new Deposito(d.id, d.nome, d.ativo);
  }

  async findAll(): Promise<Deposito[]> {
    const list = await this.prisma.deposito.findMany({ orderBy: { nome: 'asc' } });
    return list.map(d => new Deposito(d.id, d.nome, d.ativo));
  }

  async findById(id: string): Promise<Deposito | null> {
    const d = await this.prisma.deposito.findUnique({ where: { id } });
    return d ? new Deposito(d.id, d.nome, d.ativo) : null;
  }

  async findByNome(nome: string): Promise<Deposito | null> {
    const d = await this.prisma.deposito.findUnique({ where: { nome } });
    return d ? new Deposito(d.id, d.nome, d.ativo) : null;
  }

  async update(id: string, data: { nome?: string; ativo?: boolean }): Promise<Deposito> {
    const d = await this.prisma.deposito.update({ where: { id }, data });
    return new Deposito(d.id, d.nome, d.ativo);
  }
}
