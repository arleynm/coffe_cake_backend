import { TokensService } from '../../../infra/auth/tokens.service';

export class LogoutUseCase {
  constructor(private tokens: TokensService) {}

  async execute(input: { refreshToken?: string; userId?: string }) {
    if (input.refreshToken) {
      const parsed = await this.tokens.parseRefresh(input.refreshToken);
      const rec = await this.tokens.findValidRefresh(parsed.token);
      if (rec) await this.tokens.revokeById(rec.id);
      return;
    }
    if (input.userId) {
      await this.tokens.revokeAllForUser(input.userId);
    }
  }
}
