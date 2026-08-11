export type AppNotificationEntity = {
  id: string;
  type: 'PEDIDO_CRIADO' | 'PEDIDO_ATUALIZADO' | 'PEDIDO_CANCELADO';
  title: string;
  body: string;
  data: any;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
};

export abstract class AppNotificationRepository {
  abstract create(input: {
    type: AppNotificationEntity['type'];
    title: string;
    body: string;
    data?: any;
  }): Promise<AppNotificationEntity>;

  abstract list(params?: {
    take?: number;
    skip?: number;
  }): Promise<AppNotificationEntity[]>;

  abstract markAsRead(id: string): Promise<void>;
}