import { SetMetadata } from '@nestjs/common';

/**
 * Marca uma rota (ou controller inteiro) como pública, liberando-a do
 * JwtAuthGuard global. Use com parcimônia: apenas rotas que o cliente
 * final (cardápio / criar pedido / delivery público) precisa acessar sem login.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
