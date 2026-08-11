import { NotificationTokenRepository } from '../../../domain/notification/notification-token.repository';

export class SaveNotificationTokenUseCase {
  constructor(private readonly repo: NotificationTokenRepository) {}

  async execute(input: {
    token: string;
    userId?: string | null;
    platform?: string;
  }) {
    return this.repo.save(input);
  }
}