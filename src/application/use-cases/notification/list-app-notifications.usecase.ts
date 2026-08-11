import { AppNotificationRepository } from '../../../domain/notification/app-notification.repository';

export class ListAppNotificationsUseCase {
  constructor(private readonly repo: AppNotificationRepository) {}

  async execute(params?: { take?: number; skip?: number }) {
    return this.repo.list(params);
  }
}