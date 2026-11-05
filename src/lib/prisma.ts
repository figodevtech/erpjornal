import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { SUPABASE_ROOT_CA_2021 } from "@/lib/db/supabase-ca";

/**
 * TLS da conexão com o banco, sempre com verificação de certificado:
 * - DATABASE_CA_CERT definida: usa essa CA (PEM; aceita "\n" escapado).
 * - Host do Supabase: usa a CA raiz do Supabase (src/lib/db/supabase-ca.ts).
 * - Outros hosts (ex.: Postgres local): segue o sslmode da connection string.
 */
function configurarTls(connectionString: string) {
  const caPersonalizada = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n").trim();
  if (caPersonalizada) {
    return { ca: caPersonalizada, rejectUnauthorized: true };
  }

  const host = new URL(connectionString).hostname;
  if (/\.supabase\.(com|co)$/i.test(host)) {
    return { ca: SUPABASE_ROOT_CA_2021, rejectUnauthorized: true };
  }

  return undefined;
}

/**
 * Cria um PrismaClient (Prisma 7) usando o driver `pg`.
 * DATABASE_URL: pooler do Supabase em modo transação (porta 6543).
 * Timeout de conexão de 5s, igual ao padrão do Prisma 6 (o `pg` não tem).
 */
export function criarPrismaClient(connectionString = process.env.DATABASE_URL) {
  if (!connectionString) {
    throw new Error("DATABASE_URL não definida (veja .env.example).");
  }

  const adapter = new PrismaPg({
    connectionString,
    ssl: configurarTls(connectionString),
    connectionTimeoutMillis: 5_000,
  });

  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? criarPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
