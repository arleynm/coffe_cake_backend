import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PedidosEventsService } from './pedidos.events.service';
import { NotificationTokenRepository } from './domain/notification/notification-token.repository';
import { AppNotificationRepository } from './domain/notification/app-notification.repository';
import { FirebaseMessagingService } from './shared/firebase/firebase-messaging.service';
import { SendNewPedidoNotificationUseCase } from './application/use-cases/notification/send-new-pedido-notification.usecase';
import { CreateAppNotificationUseCase } from './application/use-cases/notification/create-app-notification.usecase';

@Injectable()
export class PedidosEventsListener implements OnModuleInit {
  constructor(
    private readonly events: PedidosEventsService,

    @Inject(NotificationTokenRepository)
    private readonly tokenRepo: NotificationTokenRepository,

    private readonly firebase: FirebaseMessagingService,

    @Inject(AppNotificationRepository)
    private readonly appNotificationRepo: AppNotificationRepository,
  ) {}

  onModuleInit() {
    this.events.on('pedido.created', async (event) => {
      const totalValue =
        typeof event.data.total === 'function'
          ? event.data.total()
          : event.data.total;

      const totalFormatado = Number(totalValue || 0).toFixed(2).replace('.', ',');

      await new CreateAppNotificationUseCase(this.appNotificationRepo).execute({
        type: 'PEDIDO_CRIADO',
        title: `Novo pedido #${event.data.numero}`,
        body: `Mesa ${event.data.mesa} • Total R$ ${totalFormatado}`,
        data: {
          pedidoId: event.data.id,
          numero: event.data.numero,
          mesa: event.data.mesa,
          total: totalValue,
        },
      });

      await new SendNewPedidoNotificationUseCase(
        this.tokenRepo,
        this.firebase,
      ).execute({
        id: event.data.id,
        numero: event.data.numero,
        mesa: event.data.mesa,
        total: totalValue,
      });
    });
  }
}