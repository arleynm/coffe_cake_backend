import { AppNotificationRepository } from '../../../domain/notification/app-notification.repository';

export class CreateAppNotificationUseCase {
  constructor(private readonly repo: AppNotificationRepository) {}

  async execute(input: {
    type: 'PEDIDO_CRIADO' | 'PEDIDO_ATUALIZADO' | 'PEDIDO_CANCELADO';
    title: string;
    body: string;
    data?: any;
  }) {
    return this.repo.create(input);
  }
}