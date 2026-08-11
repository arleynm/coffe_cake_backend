import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { SaveNotificationTokenDto } from '../dtos/notification/save-notification-token.dto';
import { NotificationTokenRepository } from '../../../domain/notification/notification-token.repository';
import { AppNotificationRepository } from '../../../domain/notification/app-notification.repository';
import { SaveNotificationTokenUseCase } from '../../../application/use-cases/notification/save-notification-token.usecase';
import { ListAppNotificationsUseCase } from '../../../application/use-cases/notification/list-app-notifications.usecase';
import { MarkAppNotificationReadUseCase } from '../../../application/use-cases/notification/mark-app-notification-read.usecase';

@Controller('notifications')
export class NotificationController {
  constructor(
    @Inject(NotificationTokenRepository)
    private readonly tokenRepo: NotificationTokenRepository,

    @Inject(AppNotificationRepository)
    private readonly appNotificationRepo: AppNotificationRepository,
  ) {}

  @Post('token')
  async saveToken(@Body() dto: SaveNotificationTokenDto) {
    const saved = await new SaveNotificationTokenUseCase(this.tokenRepo).execute({
      token: dto.token,
      platform: dto.platform ?? 'web',
      userId: null,
    });

    return {
      ok: true,
      id: saved.id,
    };
  }

  @Get()
  async list(@Query('take') take?: string, @Query('skip') skip?: string) {
    return new ListAppNotificationsUseCase(this.appNotificationRepo).execute({
      take: take ? Number(take) : 20,
      skip: skip ? Number(skip) : 0,
    });
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return new MarkAppNotificationReadUseCase(this.appNotificationRepo).execute(id);
  }
}