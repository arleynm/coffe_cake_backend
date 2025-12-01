// src/infra/repos/estoque/prisma-unidade.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { UnidadeRepository } from '../../../domain/estoque/repositories/unidade.repository';
import { Unidade } from '../../../domain/estoque/entities/unidade.entity';

@Injectable()
export class PrismaUnidadeRepository implements UnidadeRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: { codigo: string; nome: string; fatorBase: number }): Promise<Unidade> {
    const u = await this.prisma.unidade.create({ data });
    return new Unidade(u.id, u.codigo, u.nome, u.fatorBase, u.createdAt, u.updatedAt);
  }

  async findAll(): Promise<Unidade[]> {
    const list = await this.prisma.unidade.findMany({ orderBy: { codigo: 'asc' } });
    return list.map(
      (u) => new Unidade(u.id, u.codigo, u.nome, u.fatorBase, u.createdAt, u.updatedAt),
    );
  }

  async findByCodigo(codigo: string): Promise<Unidade | null> {
    const u = await this.prisma.unidade.findUnique({ where: { codigo } });
    return u ? new Unidade(u.id, u.codigo, u.nome, u.fatorBase, u.createdAt, u.updatedAt) : null;
  }

  async findById(id: string): Promise<Unidade | null> {
    const u = await this.prisma.unidade.findUnique({ where: { id } });
    return u ? new Unidade(u.id, u.codigo, u.nome, u.fatorBase, u.createdAt, u.updatedAt) : null;
  }

  async update(
    id: string,
    data: Partial<Pick<Unidade, 'codigo' | 'nome' | 'fatorBase'>>,
  ): Promise<Unidade> {
    const patch: Record<string, any> = {};
    if (data.codigo !== undefined) patch.codigo = data.codigo;
    if (data.nome !== undefined) patch.nome = data.nome;
    if (data.fatorBase !== undefined) patch.fatorBase = data.fatorBase;

    const u = await this.prisma.unidade.update({ where: { id }, data: patch });
    return new Unidade(u.id, u.codigo, u.nome, u.fatorBase, u.createdAt, u.updatedAt);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.unidade.delete({ where: { id } });
  }
}
