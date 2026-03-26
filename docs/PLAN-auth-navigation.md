# PLAN: Atualização de Navegação e Autenticação (Auth & Navigation)

## Visão Geral
Este plano descreve as melhorias na navegação (Header/Footer), atualização do sistema de autenticação para suportar novos papéis (assinante) e implementação de conteúdo premium no portal de notícias Revista Gestão.

## Tipo de Projeto: WEB (Next.js)

## Critérios de Sucesso
- [ ] Remoção dos botões "Central do Redator" (Footer) e "Redação" (Header).
- [ ] Substituição do botão "Assine" por um fluxo de "Login/Perfil" no Header.
- [ ] Redirecionamento inteligente após login:
    - Staff (admin, editor, juridico, reporter) → `/erp/artigos`
    - Assinantes → Home (`/`)
- [ ] Criação do papel `assinante` (Subscriber) no banco de dados.
- [ ] Implementação da flag `isPremium` no modelo de Artigo.
- [ ] Bloqueio de acesso de assinantes ao ERP via Middleware.

## Tech Stack
- Next.js 14+ (App Router)
- NextAuth.js
- Prisma (PostgreSQL)
- Tailwind CSS

## Estrutura de Arquivos Afetados
- `src/components/layout/Header.tsx`
- `src/components/layout/Footer.tsx`
- `src/lib/auth.ts`
- `src/lib/rbac.ts`
- `src/middleware.ts`
- `prisma/schema.prisma`
- `prisma/seed.ts`

---

## Task Breakdown

### Fase 1: Infraestrutura de Dados (P0)

#### [TASK-01] Atualizar Schema do Prisma
**Agente:** `database-architect` | **Skill:** `database-design`
- Adicionar campo `is_premium` (Boolean, default: false) ao modelo `Article`.
- INPUT → `prisma/schema.prisma`
- OUTPUT → Schema atualizado.
- VERIFY → `npx prisma validate`

#### [TASK-02] Rodar Migração
**Agente:** `backend-specialist` | **Skill:** `clean-code`
- Executar a migração para atualizar o banco de dados.
- INPUT → Schema atualizado.
- OUTPUT → Banco de dados atualizado.
- VERIFY → Tabela `Article` com nova coluna no banco.

#### [TASK-03] Atualizar Roles e Seed
**Agente:** `backend-specialist` | **Skill:** `clean-code`
- Adicionar role `assinante` no `seed.ts` e no `src/lib/rbac.ts`.
- INPUT → `prisma/seed.ts`, `src/lib/rbac.ts`.
- OUTPUT → Dados de role persistidos.
- VERIFY → `npx prisma db seed` executado com sucesso.

### Fase 2: Lógica de Autenticação e Redirecionamento (P1)

#### [TASK-04] Refatorar Redirecionamento de Login
**Agente:** `backend-specialist` | **Skill:** `api-patterns`
- Configurar `authOptions` no `src/lib/auth.ts` ou criar um componente de login que lide com o redirecionamento programático.
- LOGIC: Roles `admin, editor, reporter, juridico` → redirect to `/erp/artigos`. Role `assinante` → redirect to `/`.
- INPUT → `src/lib/auth.ts`, `src/app/login/page.tsx` (ou similar).
- OUTPUT → Fluxo de login atualizado.
- VERIFY → Testar logins com diferentes roles e verificar o destino.

#### [TASK-05] Atualizar Middleware de Segurança
**Agente:** `security-auditor` | **Skill:** `vulnerability-scanner`
- Garantir que usuários com role `assinante` não acessem nenhuma rota `/erp/:path*`.
- INPUT → `src/middleware.ts`
- OUTPUT → Middleware restritivo.
- VERIFY → Tentar acessar `/erp/artigos` logado como `assinante` e ser barrado.

### Fase 3: UI/UX Navigation (P2)

#### [TASK-06] Atualizar Header
**Agente:** `frontend-specialist` | **Skill:** `frontend-design`
- Remover botão "Redação".
- Substituir "Assine" por um componente dinâmico.
- Renderizar botão "Login" se deslogado.
- Renderizar Ícone de Perfil se logado.
- INPUT → `src/components/layout/Header.tsx`
- OUTPUT → Header atualizado e funcional.
- VERIFY → Verificar visualmente os estados "deslogado" e "logado".

#### [TASK-07] Limpar Footer
**Agente:** `frontend-specialist` | **Skill:** `frontend-design`
- Remover link "Central do Redator".
- INPUT → `src/components/layout/Footer.tsx`
- OUTPUT → Footer limpo.
- VERIFY → Verificar visualmente a ausência do botão.

---

## Phase X: Verificação Final (MANDATORY)

- [ ] Executar `python .agent/scripts/verify_all.py .`
- [ ] Validar Fluxo: Login Admin → `/erp/artigos`
- [ ] Validar Fluxo: Login Assinante → `/`
- [ ] Validar Bloqueio: Assinante em rota `/erp` → 403/Redirect
- [ ] Validar UI: Header e Footer sem botões antigos.
- [ ] Validar DB: Atributo `is_premium` presente.

## ✅ PHASE X COMPLETE
- Lint: [ ]
- Security: [ ]
- Build: [ ]
- Date: [Current Date]
