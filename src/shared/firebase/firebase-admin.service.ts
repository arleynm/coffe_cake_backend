import { Injectable, Logger } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging, type Messaging } from 'firebase-admin/messaging';

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private readonly firebaseMessaging: Messaging | null;

  constructor() {
    const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ?.replace(/\\n/g, '\n')
      .trim();

    if (!projectId || !clientEmail || !privateKey) {
      this.firebaseMessaging = null;
      this.logger.warn(
        'Firebase Admin não configurado. Notificações push ficarão desativadas.',
      );
      return;
    }

    try {
      const app = getApps()[0] ??
        initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
        });

      this.firebaseMessaging = getMessaging(app);
      this.logger.log('Firebase Admin inicializado.');
    } catch (error) {
      this.firebaseMessaging = null;
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Firebase Admin não pôde ser inicializado. Push desativado: ${message}`,
      );
    }
  }

  messaging(): Messaging | null {
    return this.firebaseMessaging;
  }
}
