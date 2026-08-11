import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import {
  AppNotificationEntity,
  AppNotificationRepository,
} from '../../../domain/notification/app-notification.repository';

@Injectable()
export class AppNotificationPrismaRepo implements AppNotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: {
    type: AppNotificationEntity['type'];
    title: string;
    body: string;
    data?: any;
  }): Promise<AppNotificationEntity> {
    return this.prisma.appNotification.create({
      data: {
        type: input.type,
        title: input.title,
        body: input.body,
        data: input.data ?? null,
      },
    }) as Promise<AppNotificationEntity>;
  }

  async list(params?: {
    take?: number;
    skip?: number;
  }): Promise<AppNotificationEntity[]> {
    return this.prisma.appNotification.findMany({
      orderBy: { createdAt: 'desc' },
      take: params?.take ?? 20,
      skip: params?.skip ?? 0,
    }) as Promise<AppNotificationEntity[]>;
  }

  async markAsRead(id: string): Promise<void> {
    await this.prisma.appNotification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}