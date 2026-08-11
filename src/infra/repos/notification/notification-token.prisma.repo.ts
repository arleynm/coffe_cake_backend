import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import {
  NotificationTokenEntity,
  NotificationTokenRepository,
} from '../../../domain/notification/notification-token.repository';

@Injectable()
export class NotificationTokenPrismaRepo
  implements NotificationTokenRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async save(input: {
    token: string;
    userId?: string | null;
    platform?: string;
  }): Promise<NotificationTokenEntity> {
    return this.prisma.notificationToken.upsert({
      where: { token: input.token },
      update: {
        userId: input.userId ?? null,
        platform: input.platform ?? 'web',
        isActive: true,
      },
      create: {
        token: input.token,
        userId: input.userId ?? null,
        platform: input.platform ?? 'web',
        isActive: true,
      },
    });
  }

  async listActive(): Promise<NotificationTokenEntity[]> {
    return this.prisma.notificationToken.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivateByTokens(tokens: string[]): Promise<void> {
    if (!tokens.length) return;

    await this.prisma.notificationToken.updateMany({
      where: { token: { in: tokens } },
      data: { isActive: false },
    });
  }
}