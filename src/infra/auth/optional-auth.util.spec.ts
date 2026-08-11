import * as jwt from 'jsonwebtoken';
import { isAuthenticatedRequest } from './optional-auth.util';

const SECRET = 'test-secret-optional-auth';

describe('isAuthenticatedRequest', () => {
  const original = process.env.JWT_ACCESS_SECRET;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = SECRET;
  });
  afterAll(() => {
    process.env.JWT_ACCESS_SECRET = original;
  });

  it('retorna true para access_token válido', () => {
    const token = jwt.sign({ sub: 'u1', email: 'a@b.com', role: 'ADMIN' }, SECRET, { expiresIn: 60 });
    expect(isAuthenticatedRequest({ cookies: { access_token: token } })).toBe(true);
  });

  it('retorna false sem cookie', () => {
    expect(isAuthenticatedRequest({ cookies: {} })).toBe(false);
    expect(isAuthenticatedRequest({})).toBe(false);
  });

  it('retorna false para token inválido', () => {
    expect(isAuthenticatedRequest({ cookies: { access_token: 'nao-e-um-jwt' } })).toBe(false);
  });

  it('retorna false para token assinado com outro segredo', () => {
    const token = jwt.sign({ sub: 'u1' }, 'outro-segredo', { expiresIn: 60 });
    expect(isAuthenticatedRequest({ cookies: { access_token: token } })).toBe(false);
  });

  it('retorna false para token expirado', () => {
    const token = jwt.sign({ sub: 'u1' }, SECRET, { expiresIn: -10 });
    expect(isAuthenticatedRequest({ cookies: { access_token: token } })).toBe(false);
  });
});
