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

  async signAccess(payload: { sub: string; email: string; role: string }, ttlSec: number) {
    return jwt.sign(payload, this.accessSecret, { expiresIn: ttlSec });
  }

  private sha256(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async generateRefresh(ttlSec: number) {
    const raw = crypto.randomBytes(64).toString('base64url');
    const refreshToken = raw;
    // O token é aleatório de 64 bytes (alta entropia): o SHA-256 serve de índice O(1)
    // para lookup, e o argon2 permanece como defesa em profundidade.
    const refreshTokenHash = await argon2.hash(refreshToken);
    const refreshTokenSha = this.sha256(refreshToken);
    const exp = Math.floor(Date.now() / 1000) + ttlSec;
    return { refreshToken, refreshTokenHash, refreshTokenSha, exp };
  }

  async storeRefresh(params: {
    userId: string; hashed: string; sha256?: string; userAgent?: string; ip?: string; expiresAt: Date;
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
    // 1) Caminho rápido O(1): lookup direto pelo índice único de sha256.
    const sha = this.sha256(refreshToken);
    const byIndex = await this.refreshRepo.findValidBySha256(sha);
    if (byIndex) return byIndex;

    // 2) Fallback para tokens legados (emitidos antes da coluna sha256): verifica via argon2.
    //    Some naturalmente conforme esses tokens expiram/rotacionam.
    const legacy = await this.refreshRepo.findLegacyValidCandidates(50);
    for (const c of legacy) {
      const ok = await argon2.verify(c.hashed, refreshToken);
      if (ok) return c;
    }
    return null;
  }

  revokeById(id: string) { return this.refreshRepo.revokeById(id); }
  revokeAllForUser(userId: string) { return this.refreshRepo.revokeAllForUser(userId); }
}
