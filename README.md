# Revista Gestão

Portal de jornalismo político e de gestão pública com um **ERP editorial** integrado.

- **Portal** (`src/app/(portal)`): home, notícias, categorias, regiões, revistas digitais, busca, mídia kit público, páginas institucionais.
- **ERP** (`src/app/erp`): artigos com fluxo editorial (Kanban), curadoria de RSS com IA, revistas, categorias, entidades, fontes, mídia, anúncios, mídia kit, usuários e permissões.

Visão de produto e requisitos: [PRD_Revista_Gestao.md](./PRD_Revista_Gestao.md).

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Banco | PostgreSQL no Supabase, via Prisma 7 (driver adapter `pg`) |
| Autenticação e arquivos | Supabase Auth e Supabase Storage |
| Cache e rate limit | Upstash Redis (opcional) |
| IA | OpenAI (reescrita de matérias e capas; opcional) |
| E-mail | Resend (opcional) |
| Monitoramento | Sentry (opcional), Vercel Analytics |
| Testes | Vitest |

## Como rodar do zero

Requisitos: **Node.js 22.12+** (o projeto usa Node 24) e um projeto no [Supabase](https://supabase.com).

### 1. Supabase

No painel do projeto:

1. **Auth → Sign In / Providers:** deixe *Email* ligado e **desligue** “Allow new users to sign up”. Contas são criadas pelo ERP.
2. **Auth → URL Configuration:** *Site URL* = `http://localhost:3000`; em *Redirect URLs* adicione `http://localhost:3000/redefinir-senha` (e o domínio de produção depois).
3. **Auth → Multi-Factor:** mantenha o TOTP habilitado.

### 2. Variáveis de ambiente

```bash
cp .env.example .env
```

Preencha as **obrigatórias** (URL e chaves do Supabase, `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SITE_URL` e o admin inicial `SEED_ADMIN_*`). Cada variável está explicada no próprio `.env.example`. As opcionais ligam funções extras (IA, Redis, Sentry, e-mail, barra de mercado).

### 3. Banco, Storage e dados iniciais

```bash
npm install          # também gera o Prisma Client (postinstall)
npm run db:deploy    # aplica as migrations (tabelas + RLS)
npm run db:setup     # cria os buckets do Storage e confere o RLS
npm run db:seed      # perfis, permissões, admin e conteúdo de exemplo
```

Os três comandos são idempotentes: podem ser rodados de novo sem duplicar nada.
Com `SEED_DEMO_PASSWORD` preenchida, o seed também cria usuários de teste (`editor.demo@example.com`, `reporter.demo@example.com`, `juridico.demo@example.com`).

### 4. Desenvolvimento

```bash
npm run dev
```

Portal em <http://localhost:3000> e ERP em <http://localhost:3000/erp> (entre com o admin do `.env`).

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm run typecheck` | Gera os tipos de rota (`next typegen`) e roda o `tsc` |
| `npm run lint` | ESLint |
| `npm test` / `npm run test:watch` | Vitest |
| `npm run db:deploy` | Aplica migrations pendentes (`prisma migrate deploy`) |
| `npm run db:diff` | Mostra o SQL entre o banco e o `schema.prisma` (base para uma migration nova) |
| `npm run db:migrate` | `prisma migrate dev` (exige banco *shadow*; veja abaixo) |
| `npm run db:setup` | Buckets do Storage + verificação de RLS |
| `npm run db:seed` | Dados iniciais |

### Criando uma migration

Pelo pooler do Supabase o `migrate dev` costuma falhar ao criar o banco *shadow*. O caminho recomendado:

```bash
# 1. altere prisma/schema.prisma
# 2. gere o SQL da diferença numa pasta nova de migration
mkdir prisma/migrations/AAAAMMDDHHMMSS_descricao
npm run -s db:diff > prisma/migrations/AAAAMMDDHHMMSS_descricao/migration.sql
# 3. se a migration criar tabela, acrescente: ALTER TABLE "tabela" ENABLE ROW LEVEL SECURITY;
# 4. aplique
npm run db:deploy
```

## Arquitetura e convenções

### Acesso ao banco
- `src/lib/prisma.ts`: único `PrismaClient`, com TLS **verificado** (a CA do Supabase fica em `src/lib/db/supabase-ca.ts`).
- O Prisma Client é gerado em `src/generated/prisma`, que fica fora do git. Componentes de navegador só fazem `import type` de `@/generated/prisma/enums` ou `browser`.
- Todas as tabelas têm **RLS ligado sem policies**: a API REST do Supabase não lê nem grava nada com a chave pública. O app acessa o banco só pelo Prisma.

### Autenticação e permissões (RBAC)
- **Sessão:** Supabase Auth. `src/lib/auth.ts` monta a sessão a partir de `usuarios → perfis → permissões`.
- **Formato das permissões:** `modulo:acao`, por exemplo `artigos:publicar` ou `configuracoes:gerir`. Os perfis padrão estão em `prisma/seed-data/acesso.ts`.
- **Checagem:** regras puras em `src/lib/rbac.ts`. Toda server action começa com `exigirPermissao(...)`.
- **Regras de artigos** (em `src/lib/editorial/permissoes-artigo.ts`):
  - edita o autor ou quem tem `editar_todos`;
  - publicar, despublicar e arquivar exigem `artigos:publicar`.

### Fluxo editorial
`pauta → apuração → redação → revisão → jurídico → publicado`, além de `arquivado`. A fonte única dos status e das regras é `src/lib/editorial/status.ts`. Matérias publicadas com data futura ficam agendadas e só aparecem no portal na hora marcada (`filtroArtigoNoAr` em `src/lib/data/artigos.ts`).

### Segurança
- **HTML de matérias:** é sempre sanitizado com `sanitizarHtmlArtigo` (`src/lib/html/sanitize.ts`, allowlist), tanto ao gravar quanto ao exibir.
- **URLs externas** (RSS, scraping, imagens): passam por `fetchExterno` (`src/lib/http/fetch-externo.ts`), que bloqueia redes internas (SSRF).
- **Server actions:** retornam `{ ok, error }` em vez de lançar erro, porque o Next esconde a mensagem de erros lançados em produção.
- **Entradas:** são validadas com `zod`.

### Portal e cache
- **Páginas estáticas (ISR):** as páginas do portal não leem cookies.
- **Sessão do leitor:** é carregada no navegador (`useSessaoPortal`).
- **Matérias exclusivas:** o HTML estático traz só o trecho inicial. O corpo vem de `/api/articles/[slug]/conteudo`, para quem está logado.

## Estrutura

```
prisma/              schema, migrations e seed (seed-data/)
scripts/             db-setup.ts
src/app/(portal)/    páginas públicas
src/app/erp/         ERP (cada módulo com page.tsx, actions.ts e components/)
src/app/api/         rotas públicas (artigos, busca, newsletter, views, sessão)
src/components/      componentes compartilhados (portal, layout, auth, ui)
src/lib/             regras de negócio, acesso a dados, segurança, integrações
```

## CI

`.github/workflows/ci.yml` roda typecheck, lint e testes a cada push e PR. Não precisa de variáveis de ambiente. O build de produção fica fora do CI porque consulta o banco.
