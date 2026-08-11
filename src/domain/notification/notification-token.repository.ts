export type NotificationTokenEntity = {
  id: string;
  token: string;
  userId: string | null;
  platform: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export abstract class NotificationTokenRepository {
  abstract save(input: {
    token: string;
    userId?: string | null;
    platform?: string;
  }): Promise<NotificationTokenEntity>;

  abstract listActive(): Promise<NotificationTokenEntity[]>;

  abstract deactivateByTokens(tokens: string[]): Promise<void>;
}