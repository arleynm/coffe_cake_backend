import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { isAuthenticatedRequest } from './optional-auth.util';

/**
 * Rate limiting que ignora requisições autenticadas.
 *
 * Usado em rotas públicas de escrita (ex.: criar pedido): o limite mira o
 * cliente anônimo / trote, enquanto o dono logado (balcão) não é limitado
 * mesmo criando vários pedidos seguidos no movimento.
 */
@Injectable()
export class AnonThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const { req } = this.getRequestResponse(context);
    return isAuthenticatedRequest(req);
  }
}
