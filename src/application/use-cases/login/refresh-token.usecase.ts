import { UnauthorizedException } from '@nestjs/common';
import { TokensService } from '../../../infra/auth/tokens.service';
import { UserRepository } from '../../../domain/login/repositories/user-repository';

export class RefreshTokenUseCase {
  constructor(
    private tokens: TokensService,
    private users: UserRepository,
  ) {}

  async execute(input: { refreshToken: string; userAgent?: string; ip?: string }) {
    const parsed = await this.tokens.parseRefresh(input.refreshToken);
    const record = await this.tokens.findValidRefresh(parsed.token);
    if (!record) throw new UnauthorizedException('Refresh token inválido');

    const user = await this.users.findById(record.userId);
    if (!user || !user.isActive) throw new UnauthorizedException('Usuário inativo');

    await this.tokens.revokeById(record.id);
    const refreshTtlSec = Math.floor((record.expiresAt.getTime() - Date.now()) / 1000);
    const { refreshToken, refreshTokenHash, exp } = await this.tokens.generateRefresh(refreshTtlSec);
    await this.tokens.storeRefresh({
      userId: user.id,
      hashed: refreshTokenHash,
      userAgent: input.userAgent,
      ip: input.ip,
      expiresAt: new Date(exp * 1000),
    });

    const accessTtlSec = Number(process.env.JWT_ACCESS_TTL_SEC ?? 900);
    const accessToken = await this.tokens.signAccess({ sub: user.id, email: user.email }, accessTtlSec);

    return {
      message: 'Token renovado com sucesso',
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, nome: user.nome },
    };
  }
}
