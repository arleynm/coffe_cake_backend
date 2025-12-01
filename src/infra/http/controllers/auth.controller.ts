import {
  Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards,
} from '@nestjs/common';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterUserUseCase } from '../../../application/use-cases/login/register-user.usecase';
import { LoginUserUseCase } from '../../../application/use-cases/login/login-user.usecase';
import { RefreshTokenUseCase } from '../../../application/use-cases/login/refresh-token.usecase';
import { LogoutUseCase } from '../../../application/use-cases/login/logout.usecase';
import { PrismaUserRepository } from '../../repos/auth/prisma-user.repository';
import { Argon2PasswordHasher } from '../../crypto/password-hasher';
import { TokensService } from '../../auth/tokens.service';
import { JwtAuthGuard } from '../../auth/jwt.guard';

// Swagger decorators
import { ApiTags, ApiOperation, ApiBody, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger';

// IMPORTAR TIPOS (corrige ts1272)
import type { FastifyReply, FastifyRequest } from 'fastify';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private registerUC: RegisterUserUseCase;
  private loginUC: LoginUserUseCase;
  private refreshUC: RefreshTokenUseCase;
  private logoutUC: LogoutUseCase;

  constructor(
    usersRepo: PrismaUserRepository,
    hasher: Argon2PasswordHasher,
    tokens: TokensService,
  ) {
    this.registerUC = new RegisterUserUseCase(usersRepo, hasher);
    this.loginUC = new LoginUserUseCase(usersRepo, hasher, tokens);
    this.refreshUC = new RefreshTokenUseCase(tokens, usersRepo);
    this.logoutUC = new LogoutUseCase(tokens);
  }

  @Post('register')
  @ApiOperation({ summary: 'Cadastrar novo usuário' })
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso' })
  @ApiBody({
    type: RegisterDto,
    examples: {
      default: {
        summary: 'Exemplo',
        value: { nome: 'Arley', email: 'arley@ex.com', senha: 'Senha@123' },
      },
    },
  })
  async register(@Body() dto: RegisterDto) {
    return this.registerUC.execute(dto);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login. Define cookies access_token e refresh_token' })
  @ApiOkResponse({ description: 'Autenticado; cookies definidos; retorna dados do usuário' })
  @ApiBody({
    type: LoginDto,
    examples: {
      default: {
        summary: 'Exemplo',
        value: { email: 'arley@ex.com', senha: 'Senha@123', remember: true },
      },
    },
  })
  async login(
    @Body() dto: LoginDto,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const { user, accessToken, refreshToken } = await this.loginUC.execute({
      ...dto,
      userAgent: (req.headers['user-agent'] as string | undefined) ?? undefined,
      ip: (req.ip as string) || undefined,
    });

    this.setAuthCookies(res, accessToken, refreshToken, dto.remember === true);
    return { user };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renova access token usando o refresh_token do cookie (rotaciona o refresh)' })
  @ApiOkResponse({ description: 'Tokens renovados; cookies atualizados' })
  async refresh(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;
    if (!refreshToken) throw new Error('Sem refresh token');

    const { user, accessToken, refreshToken: newRefresh } = await this.refreshUC.execute({
      refreshToken,
      userAgent: (req.headers['user-agent'] as string | undefined) ?? undefined,
      ip: (req.ip as string) || undefined,
    });

    const remember = req.cookies?.['remember'] === '1';
    this.setAuthCookies(res, accessToken, newRefresh, remember);
    return { user };
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout. Revoga refresh token e limpa cookies' })
  @ApiOkResponse({ description: 'Logout efetuado' })
  async logout(
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply
  ) {
    const refreshToken = req.cookies?.['refresh_token'] as string | undefined;
    if (refreshToken) {
      await this.logoutUC.execute({ refreshToken });
    }
    this.clearAuthCookies(res);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Retorna o usuário autenticado (via access_token no cookie)' })
  @ApiOkResponse({ description: 'Usuário autenticado' })
  me(@Req() req: any) {
    return { sub: req.user.sub, email: req.user.email };
  }

  // Em Fastify, maxAge é em SEGUNDOS
  private setAuthCookies(res: FastifyReply, access: string, refresh: string, remember: boolean) {
    const isProd = process.env.NODE_ENV === 'production';
    const accessMaxAgeSec = Number(process.env.COOKIE_ACCESS_MAX_AGE ?? 15 * 60); // 15m
    const refreshMaxAgeSec = remember
      ? Number(process.env.COOKIE_REFRESH_REMEMBER_MAX_AGE ?? 30 * 24 * 60 * 60)
      : Number(process.env.COOKIE_REFRESH_MAX_AGE ?? 7 * 24 * 60 * 60);

    res.setCookie('access_token', access, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: accessMaxAgeSec,
      path: '/',
    });

    res.setCookie('refresh_token', refresh, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProd,
      maxAge: refreshMaxAgeSec,
      path: '/auth', // opcional: restringir a /auth
    });

    res.setCookie('remember', remember ? '1' : '0', {
      httpOnly: false, // flag de UI
      sameSite: 'lax',
      secure: isProd,
      maxAge: refreshMaxAgeSec,
      path: '/',
    });
  }

  private clearAuthCookies(res: FastifyReply) {
    const isProd = process.env.NODE_ENV === 'production';
    const base = { path: '/', sameSite: 'lax' as const, secure: isProd, httpOnly: true as const };

    res.clearCookie('access_token', base);
    res.clearCookie('refresh_token', { ...base, path: '/auth' });
    res.clearCookie('remember', { path: '/', sameSite: 'lax', secure: isProd, httpOnly: false });
  }
}
