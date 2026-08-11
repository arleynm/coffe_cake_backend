import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// No Prisma 7, com prisma.config.ts presente, o .env NÃO é carregado
// automaticamente. Carregamos explicitamente dos locais padrão:
//   - .env na raiz do backend (dev local)
//   - prisma/.env (ao lado do schema — usado em alguns servidores)
// dotenv não sobrescreve variáveis já definidas no processo, então a
// ordem é segura e um export no shell também continua funcionando.
loadEnv();
loadEnv({ path: "prisma/.env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
