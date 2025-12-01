import { UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../../domain/login/repositories/user-repository';
import { PasswordHasher } from '../../../infra/crypto/password-hasher';
import { TokensService } from '../../../infra/auth/tokens.service';

export class LoginUserUseCase {
  constructor(
    private users: UserRepository,
    private hasher: PasswordHasher,
    private tokens: TokensService,
  ) {}

  async execute(input: {
    email: string; senha: string; remember?: boolean;
    userAgent?: string; ip?: string;
  }) {
    const user = await this.users.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const ok = await this.hasher.compare(input.senha, user.props.senhaHash);
    if (!ok) throw new UnauthorizedException('Usuário ou senha inválidos');

    const accessTtlSec = Number(process.env.JWT_ACCESS_TTL_SEC ?? 900);
    const refreshTtlSec = input.remember
      ? Number(process.env.JWT_REFRESH_REMEMBER_TTL_SEC ?? 60 * 60 * 24 * 30)
      : Number(process.env.JWT_REFRESH_TTL_SEC ?? 60 * 60 * 24 * 7);

    const accessToken = await this.tokens.signAccess({ sub: user.id, email: user.email }, accessTtlSec);
    const { refreshToken, refreshTokenHash, exp } = await this.tokens.generateRefresh(refreshTtlSec);

    await this.tokens.storeRefresh({
      userId: user.id,
      hashed: refreshTokenHash,
      userAgent: input.userAgent,
      ip: input.ip,
      expiresAt: new Date(exp * 1000),
    });

    return {
      message: 'Login realizado com sucesso',
      user: { id: user.id, nome: user.nome, email: user.email },
      accessToken,
      refreshToken,
    };
  }
}
