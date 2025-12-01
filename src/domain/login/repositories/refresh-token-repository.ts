export interface RefreshTokenRecord {
  id: string;
  userId: string;
  hashed: string;
  userAgent?: string | null;
  ip?: string | null;
  expiresAt: Date;
  revokedAt?: Date | null;
}

export interface RefreshTokenRepository {
  create(params: {
    userId: string; hashed: string; userAgent?: string; ip?: string; expiresAt: Date;
  }): Promise<RefreshTokenRecord>;

  findValidByUser(userId: string, hashed: string): Promise<RefreshTokenRecord | null>;

  revokeById(id: string): Promise<void>;

  revokeAllForUser(userId: string): Promise<void>;

  deleteExpired(): Promise<number>;
}
