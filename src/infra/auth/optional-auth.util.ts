import * as jwt from 'jsonwebtoken';

/**
 * Verifica de forma "best-effort" se a requisição traz um access_token válido
 * no cookie, SEM bloquear a rota. Usado em rotas públicas que precisam se
 * comportar de forma diferente para o dono (autenticado) e para o cliente final.
 *
 * Aceita qualquer objeto de request que exponha `cookies` (FastifyRequest ou o
 * Record genérico do ThrottlerGuard). Retorna true apenas se o token for válido.
 */
export function isAuthenticatedRequest(req: { cookies?: Record<string, string | undefined> }): boolean {
  try {
    const token = req?.cookies?.['access_token'];
    if (!token) return false;

    jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);
    return true;
  } catch {
    return false;
  }
}
