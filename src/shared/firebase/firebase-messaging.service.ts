import { Injectable, Logger } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';

@Injectable()
export class FirebaseMessagingService {
  private readonly logger = new Logger(FirebaseMessagingService.name);
  private warnedUnavailable = false;

  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async sendToToken(
    token: string,
    payload: {
      title: string;
      body: string;
      data?: Record<string, string>;
      link?: string;
    },
  ) {
    const messaging = this.firebaseAdmin.messaging();

    if (!messaging) {
      if (!this.warnedUnavailable) {
        this.logger.warn(
          'Envio de push ignorado porque o Firebase Admin não está configurado.',
        );
        this.warnedUnavailable = true;
      }
      return null;
    }

    return messaging.send({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
      webpush: {
        notification: {
          title: payload.title,
          body: payload.body,
          icon: '/icons/icon-192x192.png',
        },
        fcmOptions: payload.link
          ? { link: payload.link }
          : undefined,
      },
    });
  }
}
