import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';
import * as argon2 from 'argon2';
import * as jwt from 'jsonwebtoken';
import { PrismaRefreshTokenRepository } from '../repos/auth/prisma-refresh-token.repository';

@Injectable()
export class TokensService {
  private accessSecret = process.env.JWT_ACCESS_SECRET!;
  private refreshSecret = process.env.JWT_REFRESH_SECRET!; // usado só para assinar/validar payload opcional do refresh se quiser

  constructor(private refreshRepo: PrismaRefreshTokenRepository) {}

  async signAccess(payload: { sub: string; email: string }, ttlSec: number) {
    return jwt.sign(payload, this.accessSecret, { expiresIn: ttlSec });
  }

  async generateRefresh(ttlSec: number) {
    const raw = crypto.randomBytes(64).toString('base64url');
    const refreshToken = raw;
    const refreshTokenHash = await argon2.hash(refreshToken);
    const exp = Math.floor(Date.now() / 1000) + ttlSec;
    return { refreshToken, refreshTokenHash, exp };
  }

  async storeRefresh(params: {
    userId: string; hashed: string; userAgent?: string; ip?: string; expiresAt: Date;
  }) {
    return this.refreshRepo.create(params);
  }

  // parse aqui apenas transforma em hash novamente para comparação
  async parseRefresh(refreshToken: string) {
    // Não dá para "re-hash" e comparar; então buscaremos por tentativa: precisamos verificar contra os hashs salvos.
    // Estratégia: vamos devolver um "hash" falso e a verificação real ocorre em findValidRefresh.
    return { token: refreshToken };
  }

  async findValidRefresh(refreshToken: string) {
    // Buscar todos tokens não revogados e não expirados (poderia filtrar por userId se tiver no cookie)
    // Melhor: faça lookup pelo usuário primeiro (via sessão) — aqui faremos varredura (pode otimizar).
    // Implementação prática: crie um índice reverso guardando SHA256 em col extra. Simples agora:
    const sha = crypto.createHash('sha256').update(refreshToken).digest('hex');
    // => ajuste schema p/ ter column 'sha256' se quiser O(1). Aqui faremos fallback:
    // Vamos pegar todos não expirados e testar argon2.verify (poucos por usuário).
    const now = new Date();

    // Otimização simples: liste últimos tokens e verifique
    // Como não temos userId aqui, você pode armazenar userId no cookie em outro cookie assinado (opcional).
    // Para manter exemplo enxuto, busque os últimos 50:
    const candidates = await (this.refreshRepo as any).prisma.refreshToken.findMany({
      where: { revokedAt: null, expiresAt: { gt: now } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    for (const c of candidates) {
      const ok = await argon2.verify(c.hashed, refreshToken);
      if (ok) return c;
    }
    return null;
  }

  revokeById(id: string) { return this.refreshRepo.revokeById(id); }
  revokeAllForUser(userId: string) { return this.refreshRepo.revokeAllForUser(userId); }
}
