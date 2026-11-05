/**
 * Prepara a infraestrutura do Supabase que não é coberta pelas migrations:
 *  1. Cria/atualiza os buckets do Storage (src/lib/storage/buckets.ts).
 *  2. Garante RLS ligado em todas as tabelas do schema public.
 *
 * Uso: npm run db:setup   (rode depois de `npm run db:deploy`)
 * É idempotente: pode ser executado quantas vezes for necessário.
 */
import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

import { STORAGE_BUCKETS } from "../src/lib/storage/buckets";

function exigirEnv(nome: string) {
  const valor = process.env[nome];
  if (!valor) {
    console.error(`✗ Variável ${nome} não definida no .env`);
    process.exit(1);
  }
  return valor;
}

async function configurarBuckets() {
  const supabase = createClient(
    exigirEnv("NEXT_PUBLIC_SUPABASE_URL"),
    exigirEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: existentes, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(`Falha ao listar buckets: ${error.message}`);

  for (const bucket of Object.values(STORAGE_BUCKETS)) {
    const opcoes = {
      public: bucket.public,
      allowedMimeTypes: [...bucket.allowedMimeTypes],
      fileSizeLimit: bucket.fileSizeLimit,
    };
    const jaExiste = existentes?.some((b) => b.name === bucket.name);

    const { error: erro } = jaExiste
      ? await supabase.storage.updateBucket(bucket.name, opcoes)
      : await supabase.storage.createBucket(bucket.name, opcoes);

    if (erro) throw new Error(`Bucket "${bucket.name}": ${erro.message}`);
    console.log(`✓ Bucket ${bucket.name} ${jaExiste ? "atualizado" : "criado"}`);
  }
}

async function garantirRls() {
  const prisma = new PrismaClient();
  try {
    const semRls = await prisma.$queryRaw<{ tabela: string }[]>`
      select c.relname as tabela
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
      order by c.relname
    `;

    for (const { tabela } of semRls) {
      // Nome vem do catálogo do Postgres; aspas duplas escapadas por segurança.
      await prisma.$executeRawUnsafe(
        `alter table public."${tabela.replace(/"/g, '""')}" enable row level security`
      );
      console.log(`✓ RLS ligado em ${tabela}`);
    }

    const [{ total }] = await prisma.$queryRaw<{ total: bigint }[]>`
      select count(*) as total
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity
    `;
    console.log(
      semRls.length
        ? `✓ RLS corrigido em ${semRls.length} tabela(s); ${total} com RLS no total`
        : `✓ RLS já estava ligado em todas as ${total} tabelas do schema public`
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log("== Storage ==");
  await configurarBuckets();
  console.log("== Row Level Security ==");
  await garantirRls();
  console.log("Setup concluído.");
}

main().catch((erro) => {
  console.error("✗", erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
