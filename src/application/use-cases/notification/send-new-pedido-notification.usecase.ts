import { NotificationTokenRepository } from '../../../domain/notification/notification-token.repository';
import { FirebaseMessagingService } from '../../../shared/firebase/firebase-messaging.service';

type PedidoNotificationInput = {
  id: string;
  numero: number;
  mesa: string;
  total: number | string;
};

export class SendNewPedidoNotificationUseCase {
  constructor(
    private readonly repo: NotificationTokenRepository,
    private readonly firebase: FirebaseMessagingService,
  ) {}

  async execute(pedido: PedidoNotificationInput) {
    const tokens = await this.repo.listActive();

    console.log('[SendNewPedidoNotificationUseCase] tokens ativos:', tokens.length);

    if (!tokens.length) return;

    const invalidTokens: string[] = [];

    const totalFormatado = Number(pedido.total || 0).toFixed(2).replace('.', ',');

    await Promise.allSettled(
      tokens.map(async ({ token }) => {
        try {
          await this.firebase.sendToToken(token, {
            title: `Novo pedido #${pedido.numero}`,
            body: `Mesa ${pedido.mesa} • Total R$ ${totalFormatado}`,
            link: '/pedidos/mesas',
            data: {
              type: 'pedido.created',
              pedidoId: String(pedido.id),
              numero: String(pedido.numero),
              mesa: String(pedido.mesa),
              total: String(pedido.total),
            },
          });
        } catch (error: any) {
          const code =
            error?.errorInfo?.code || error?.code || error?.message || '';

          console.error('[SendNewPedidoNotificationUseCase] erro ao enviar:', code);

          if (
            String(code).includes('registration-token-not-registered') ||
            String(code).includes('invalid-registration-token')
          ) {
            invalidTokens.push(token);
          }
        }
      }),
    );

    await this.repo.deactivateByTokens(invalidTokens);
  }
}