import "dotenv/config";

import { defineConfig } from "prisma/config";

/**
 * Configuração do CLI do Prisma (migrate, db seed, generate).
 *
 * O CLI usa DIRECT_URL (pooler do Supabase em modo sessão, porta 5432),
 * necessária para migrations. A aplicação usa DATABASE_URL (modo transação)
 * via driver adapter em src/lib/prisma.ts.
 *
 * `prisma generate` não precisa de banco: sem a variável (ex.: no CI),
 * a URL fica vazia e só os comandos que conectam falham.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
