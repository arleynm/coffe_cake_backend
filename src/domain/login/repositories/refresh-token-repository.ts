export interface RefreshTokenRecord {
  id: string;
  userId: string;
  hashed: string;
  sha256?: string | null;
  userAgent?: string | null;
  ip?: string | null;
  expiresAt: Date;
  revokedAt?: Date | null;
}

export interface RefreshTokenRepository {
  create(params: {
    userId: string; hashed: string; sha256?: string; userAgent?: string; ip?: string; expiresAt: Date;
  }): Promise<RefreshTokenRecord>;

  findValidByUser(userId: string, hashed: string): Promise<RefreshTokenRecord | null>;

  /** Busca O(1) por índice único de sha256 (token válido: não revogado e não expirado). */
  findValidBySha256(sha256: string): Promise<RefreshTokenRecord | null>;

  /** Fallback para tokens legados (sem sha256 gravado): candidatos válidos a verificar via argon2. */
  findLegacyValidCandidates(limit: number): Promise<RefreshTokenRecord[]>;

  revokeById(id: string): Promise<void>;

  revokeAllForUser(userId: string): Promise<void>;

  deleteExpired(): Promise<number>;
}
