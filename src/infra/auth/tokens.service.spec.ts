import * as crypto from 'node:crypto';
import * as argon2 from 'argon2';
import { TokensService } from './tokens.service';

function makeRepo() {
  return {
    create: jest.fn(),
    findValidByUser: jest.fn(),
    findValidBySha256: jest.fn(),
    findLegacyValidCandidates: jest.fn().mockResolvedValue([]),
    revokeById: jest.fn(),
    revokeAllForUser: jest.fn(),
    deleteExpired: jest.fn(),
  };
}

const sha = (t: string) => crypto.createHash('sha256').update(t).digest('hex');

describe('TokensService — refresh token com sha256 indexado', () => {
  it('generateRefresh produz um sha256 que corresponde ao token', async () => {
    const svc = new TokensService(makeRepo() as any);
    const { refreshToken, refreshTokenSha } = await svc.generateRefresh(60);
    expect(refreshTokenSha).toBe(sha(refreshToken));
  });

  it('findValidRefresh usa o índice sha256 (O(1)) e não varre os legados', async () => {
    const repo = makeRepo();
    const rec = { id: 'r1' };
    repo.findValidBySha256.mockResolvedValue(rec);

    const svc = new TokensService(repo as any);
    const res = await svc.findValidRefresh('meu-token');

    expect(res).toBe(rec);
    expect(repo.findValidBySha256).toHaveBeenCalledWith(sha('meu-token'));
    expect(repo.findLegacyValidCandidates).not.toHaveBeenCalled();
  });

  it('cai no fallback (argon2) para tokens legados sem sha256', async () => {
    const repo = makeRepo();
    repo.findValidBySha256.mockResolvedValue(null);

    const svc = new TokensService(repo as any);
    const { refreshToken, refreshTokenHash } = await svc.generateRefresh(60);
    repo.findLegacyValidCandidates.mockResolvedValue([{ id: 'legacy', hashed: refreshTokenHash }]);

    const res = await svc.findValidRefresh(refreshToken);
    expect((res as any).id).toBe('legacy');
  });

  it('retorna null quando nada casa (índice e legados)', async () => {
    const repo = makeRepo();
    repo.findValidBySha256.mockResolvedValue(null);
    repo.findLegacyValidCandidates.mockResolvedValue([{ id: 'x', hashed: await argon2.hash('outro-token') }]);

    const svc = new TokensService(repo as any);
    expect(await svc.findValidRefresh('token-que-nao-existe')).toBeNull();
  });
});
