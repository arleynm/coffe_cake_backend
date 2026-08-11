import { AppNotificationRepository } from '../../../domain/notification/app-notification.repository';

export class MarkAppNotificationReadUseCase {
  constructor(private readonly repo: AppNotificationRepository) {}

  async execute(id: string) {
    await this.repo.markAsRead(id);
    return { ok: true };
  }
}