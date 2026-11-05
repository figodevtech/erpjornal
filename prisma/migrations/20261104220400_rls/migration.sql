-- Habilita Row Level Security (RLS) em todas as tabelas do schema public.
--
-- O app acessa o banco somente pelo Prisma, conectado como dono das tabelas,
-- que nao e afetado pelo RLS. Sem nenhuma policy, a Data API do Supabase
-- (chave publishable/anon e usuarios autenticados via REST/GraphQL) fica sem
-- acesso de leitura ou escrita a essas tabelas.
--
-- Migrations futuras que criarem tabelas devem incluir
--   ALTER TABLE "nova_tabela" ENABLE ROW LEVEL SECURITY;
-- (o `npm run db:setup` tambem verifica e corrige tabelas sem RLS).
DO $$
DECLARE
  t record;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;
