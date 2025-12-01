import { ConflictException } from '@nestjs/common';
import { UserRepository } from '../../../domain/login/repositories/user-repository';
import { PasswordHasher } from '../../../infra/crypto/password-hasher';

export class RegisterUserUseCase {
  constructor(private users: UserRepository, private hasher: PasswordHasher) {}

  async execute(input: { nome: string; email: string; senha: string }) {
    const existing = await this.users.findByEmail(input.email);
    if (existing) throw new ConflictException('E-mail já cadastrado');

    const senhaHash = await this.hasher.hash(input.senha);
    const user = await this.users.create({ nome: input.nome, email: input.email, senhaHash });

    return {
      message: 'Usuário registrado com sucesso',
      user: { id: user.id, nome: user.nome, email: user.email },
    };
  }
}
