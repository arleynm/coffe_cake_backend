import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      datasources: { db: { url: process.env.DATABASE_URL } },
      // Logs úteis em dev; em prod, normalmente só 'error'
      log: process.env.NODE_ENV === 'development'
        ? ['warn', 'error'] // se quiser ver queries: [{ emit: 'event', level: 'query' }]
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
