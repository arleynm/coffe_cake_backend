import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { RefreshTokenRepository, RefreshTokenRecord } from '../../../domain/login/repositories/refresh-token-repository';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private prisma: PrismaService) {}

  async create(params: any): Promise<RefreshTokenRecord> {
    const r = await this.prisma.refreshToken.create({ data: params });
    return r;
  }
  async findValidByUser(userId: string, hashed: string) {
    const r = await this.prisma.refreshToken.findFirst({
      where: { userId, hashed, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    return r;
  }
  async findValidBySha256(sha256: string) {
    const r = await this.prisma.refreshToken.findFirst({
      where: { sha256, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    return r;
  }
  async findLegacyValidCandidates(limit: number) {
    return this.prisma.refreshToken.findMany({
      where: { sha256: null, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
  async revokeById(id: string) {
    await this.prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  }
  async revokeAllForUser(userId: string) {
    await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }
  async deleteExpired() {
    const res = await this.prisma.refreshToken.deleteMany({ where: { expiresAt: { lte: new Date() } } });
    return res.count;
  }
}
