import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { UserRepository } from '../../../domain/login/repositories/user-repository';
import { Role, User } from '../../../domain/login/entities/user';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    const u = await this.prisma.usuario.findUnique({ where: { email } });
    return u ? new User({ id: u.id, nome: u.nome, email: u.email, senhaHash: u.senhaHash, role: u.role as Role, isActive: u.isActive }) : null;
    }
  async findById(id: string) {
    const u = await this.prisma.usuario.findUnique({ where: { id } });
    return u ? new User({ id: u.id, nome: u.nome, email: u.email, senhaHash: u.senhaHash, role: u.role as Role, isActive: u.isActive }) : null;
  }
  async create(data: { nome: string; email: string; senhaHash: string; role: Role }) {
    const u = await this.prisma.usuario.create({ data });
    return new User({ id: u.id, nome: u.nome, email: u.email, senhaHash: u.senhaHash, role: u.role as Role, isActive: u.isActive });
  }
}
