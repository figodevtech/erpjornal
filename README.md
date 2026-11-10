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
3. **Auth → Multi-Factor:** mantenha o TOTP (*Authenticator app*) habilitado. Admin e editor precisam dele para usar o ERP: no primeiro login, o sistema pede para cadastrar o celular.

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

### Autenticação em dois fatores (MFA)
- **Quem precisa:** admin e editor (`MFA_OBRIGATORIO=true`, o padrão), e qualquer pessoa que já tenha cadastrado um autenticador.
- **Como funciona:** depois da senha, o ERP manda para `/seguranca/mfa`, onde a pessoa cadastra o aplicativo (QR code) ou digita o código. Até confirmar, a sessão fica sem as permissões do ERP: páginas, actions e rotas recusam.
- **Nível da sessão:** é lido do token já validado pelo Supabase Auth (`aal2` = senha + código). As regras puras estão em `src/lib/mfa.ts`.
- **Celular perdido:** outro administrador usa *Usuários → Ações → Redefinir MFA*. Se for o único admin, remova o fator no painel do Supabase (*Authentication → Users → usuário → MFA*).

### Exclusão lógica e auditoria
- **Nada é apagado de verdade:** artigos, revistas, categorias, políticos, anúncios, feeds e mídia kits recebem `excluido_em`. Uma extensão do Prisma (`src/lib/db/exclusao-logica.ts`) esconde os excluídos nas leituras e recusa `delete`/`deleteMany` nesses models; para incluir excluídos numa leitura, passe `excluidoEm` no `where` (ex.: `excluidoEm: undefined`). Relações em `include` não são filtradas automaticamente.
- **Trilha de auditoria:** toda action de escrita chama `registrarAuditoria()` (`src/lib/auditoria.ts`), que grava quem, o quê, antes/depois, IP e user-agent. Senhas e tokens nunca entram no log. A consulta e a exportação CSV ficam em `/erp/auditoria` (permissão `auditoria:ler`).
- **Matéria publicada:** cada edição guarda a versão anterior; o slug só muda com `artigos:publicar`, e o endereço antigo redireciona para o novo.
- **Checagem obrigatória:** categorias marcadas com "exige checagem" não publicam matéria sem ao menos uma checagem de fato.

### Newsletter, plantão e alertas
- **Inscrição com dupla confirmação (LGPD):** o formulário grava a inscrição como *pendente* e envia um link (vale 7 dias). Só quem confirma recebe. Confirmar e sair da lista acontecem por botão (POST), porque filtros de e-mail abrem os links sozinhos. Todo envio traz o link de descadastro e o cabeçalho de descadastro de um clique (`List-Unsubscribe-Post`).
- **Envio:** matéria publicada com o canal *Newsletter* sai para os confirmados uma única vez, até 48h depois de entrar no ar, em lotes de 100 pelo Resend (`src/lib/newsletter/`). O disparo roda depois da publicação (`after`).
- **Envio retomável:** cada lote grava o progresso (cursor do último inscrito). Um envio parado há mais de 10 min em "enviando" é retomado pelo cron de onde parou; a chave de idempotência sai do conteúdo do lote, então quem já recebeu não recebe de novo.
- **Cron:** `/api/cron/newsletter` envia as matérias agendadas que entraram no ar e retoma envios interrompidos. Já está agendada a cada 10 min no `vercel.json` (a Vercel manda `Authorization: Bearer $CRON_SECRET` sozinha). Sem cron, as agendadas saem junto com a próxima publicação.
- **ERP:** `/erp/newsletter` (permissão `newsletter:gerir`) mostra inscritos e envios, exporta CSV e apaga dados a pedido do titular. Essa é a única exclusão física do sistema, e fica na auditoria sem o e-mail.
- **Plantão:** avisos na faixa do topo do portal (`/erp/plantao`, permissão `plantao:gerir`). Com `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`, cada aviso também vai para o canal da redação.

### Cache do portal
As páginas ficam no route group `(portal)`. Para invalidar páginas dinâmicas, use os helpers de `src/lib/cache/portal.ts`: `revalidatePath("/noticia/[slug]", "page")` sem o grupo não invalida nada.

- **Só o que mudou no ar:** salvar um rascunho que nunca foi publicado não invalida nada no portal (`afetaPortal` em `src/lib/editorial/status.ts`). Mudanças em matérias publicadas invalidam as listagens e só a página daquela matéria (`revalidarMateriasNoPortal([slug])`).

### Fluxo editorial
`pauta → apuração → redação → revisão → jurídico → publicado`, além de `arquivado`. A fonte única dos status e das regras é `src/lib/editorial/status.ts`. Matérias publicadas com data futura ficam agendadas e só aparecem no portal na hora marcada.

- **Toda consulta pública usa `filtroArtigoNoAr()`** (`src/lib/data/artigos.ts`), nunca só `status: publicado`: filtrar só o status vaza matéria agendada (título e resumo) antes da hora. Um teste (`src/lib/data/__tests__/filtro-no-ar.test.ts`) falha se alguém filtrar à mão no código do portal, da API ou da busca.

### Datas e fuso horário
O servidor de produção (Vercel) roda em **UTC**. Sem fuso explícito, o `datetime-local` "14:00" vira 14h UTC (11h em Brasília) e `toLocaleDateString` mostra o dia de Londres. Use sempre `src/lib/datas.ts`:
- `lerDataHoraLocal(valor)` para ler `datetime-local`/`date` vindos de formulário;
- `paraDataHoraLocal(data)` para preencher esses campos;
- `formatarData`, `formatarHora` e `formatarDataHora` para exibir (servem para server e client components).

### Segurança
- **HTML de matérias:** é sempre sanitizado com `sanitizarHtmlArtigo` (`src/lib/html/sanitize.ts`, allowlist), tanto ao gravar quanto ao exibir.
- **URLs externas** (RSS, scraping, imagens): passam por `fetchExterno` (`src/lib/http/fetch-externo.ts`), que bloqueia redes internas (SSRF).
- **Server actions:** retornam `{ ok, error }` em vez de lançar erro, porque o Next esconde a mensagem de erros lançados em produção. Para actions que lançam internamente (IA, upload, curadoria, anúncios), use `comoResultado()` de `src/lib/acao.ts`, que mantém os redirecionamentos de permissão e não mostra detalhes do banco.
- **Fontes confidenciais:** ver, editar e anotar exige `fontes:confidencial`; nível desconhecido conta como confidencial, e a auditoria não guarda o nome de fonte confidencial (`src/lib/fontes/sigilo.ts`).
- **Cabeçalhos:** `next.config.ts` envia `frame-ancestors 'self'`/`X-Frame-Options` (nenhum site externo abre o ERP num iframe), `nosniff`, `Referrer-Policy`, `Permissions-Policy` e HSTS.
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

## Deploy na Vercel

1. **Plano:** o plano Hobby é só para uso não comercial e aceita cron apenas uma vez por dia (o deploy falha com o `*/10` do `vercel.json`). Um portal com anúncios precisa do **Pro**.
2. **Região:** o `vercel.json` fixa as funções em `pdx1` (Oregon), ao lado do banco no Supabase `us-west-2`. Se o banco mudar de região, ajuste (São Paulo = `gru1` com Supabase `sa-east-1`).
3. **Variáveis** (Project Settings → Environment Variables, em Production e Preview): todas as obrigatórias do `.env.example`, mais `UPSTASH_REDIS_REST_URL`/`TOKEN` (obrigatórias em produção), `CRON_SECRET`, `RESEND_API_KEY` e `EMAIL_FROM` (domínio verificado no Resend). `NEXT_PUBLIC_SITE_URL` é o domínio final, com `https://`. As `SEED_*` não vão para a Vercel. As `NEXT_PUBLIC_*` entram no build: mudou, faça novo deploy.
4. **Banco antes do código:** rode `npm run db:deploy` (e `npm run db:setup` na primeira vez) apontando para o banco de produção **antes** de publicar uma versão que traga migration nova. O build não aplica migrations.
5. **Supabase Auth:** em *URL Configuration*, troque o *Site URL* pelo domínio de produção e adicione `https://SEU-DOMINIO/redefinir-senha` nas *Redirect URLs*.
6. **Uploads:** a Vercel recusa requisições acima de 4,5 MB. O navegador reduz as imagens antes do envio (`src/lib/imagens/reduzir.ts`); GIF/AVIF acima de 3,5 MB precisam ser reduzidos antes.
7. **Build:** consulta o banco (sitemap e páginas do portal), então `DATABASE_URL` precisa valer também no ambiente de build.
