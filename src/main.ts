import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';

import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'node:path';

const parseOrigins = (env?: string) =>
  new Set(
    (env || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.setGlobalPrefix('api');

  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  });

  await app.register(cookie, { secret: process.env.COOKIE_SECRET });

  const isDevEnv = process.env.NODE_ENV !== 'production';
  const host = process.env.HOST ?? (isDevEnv ? '127.0.0.1' : '127.0.0.1');
  const port = Number(process.env.PORT ?? 3007);

  const allowed = parseOrigins(process.env.CORS_ORIGIN);
  const isLocalHost = host === '127.0.0.1' || host === 'localhost';

  if (isLocalHost || allowed.size === 0) {
    [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3001',
    ].forEach((o) => allowed.add(o));
  }

  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const serverUrl = `http://${host}:${port}`;
      const ok = origin === serverUrl || allowed.has(origin);

      (app.getHttpAdapter().getInstance().log || console).info?.(
        { origin, ok, serverUrl, allowed: Array.from(allowed) },
        'CORS check',
      );

      cb(ok ? null : new Error(`Origin ${origin} not allowed by CORS`), ok);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Content-Length'],
    maxAge: 86400,
  });

  await app.register(multipart, {
    attachFieldsToBody: false, 
    limits: {
      fileSize: 10 * 1024 * 1024, 
      files: 1,
      fields: 50,
    },
  });

  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(fastifyStatic, {
    root: join(process.cwd(), 'public', 'uploads'),
    prefix: '/uploads/', 
    decorateReply: false,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('Coffe Cake API')
    .setDescription('Documentação da API')
    .setVersion('1.0.0')
    .addCookieAuth('access_token', { type: 'apiKey', in: 'cookie' })
    .addServer('/', 'Same origin')
    .addServer(`http://${host}:${port}`, 'Dev local')
    .addServer('https://coffecake.com.br', 'Prod')
    .build();

  const document = SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: false });

  app.getHttpAdapter().get('/api/openapi.json', (_req, reply) => reply.send(document));
  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customSiteTitle: 'Coffe Cake — Swagger',
  });

  // 🔹 Scalar em /api/docs
  await fastify.register((await import('@scalar/fastify-api-reference')).default, {
    routePrefix: '/api/docs',
    configuration: { url: '/api/openapi.json' },
    logLevel: 'silent',
  });

  await app.listen({ host, port });
  console.log(`🚀 Server running at http://${host}:${port}`);
}

bootstrap();
