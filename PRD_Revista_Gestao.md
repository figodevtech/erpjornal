# PRD — Revista Gestão: Portal de Notícias Políticas & Sistema ERP Editorial

> **Versão:** 1.0.0  
> **Data:** 2026-03-24  
> **Status:** Em Planejamento  
> **Baseado em análise de:** [JN News](https://www.jnnews.com.br/) — referência de portal noticioso nacional  

---

## 1. Visão Geral do Produto

### 1.1 Descrição

A **Revista Gestão** é um portal de jornalismo político com foco em cobertura das esferas Executiva, Legislativa e Judiciária do Brasil. O produto é composto por dois sistemas integrados:

1. **Portal Público (Frontend)** — experiência do leitor, otimizada para legibilidade, acessibilidade e multiformatos.
2. **ERP Editorial (Painel Administrativo)** — sistema de gestão do ciclo de vida das notícias, com workflow editorial, rastreabilidade e distribuição omnichannel.

### 1.2 Problema que Resolve

Portais como o JN News apresentam limitações críticas observadas na análise:
- Ausência de sistema de Breaking News em tempo real estruturado
- Falta de taxonomia política granular (Executivo/Legislativo/Judiciário)
- Sem suporte nativo a podcasts ou vídeos curtos
- Ausência de Dark Mode e acessibilidade para leitores de texto-para-áudio
- Sem workflow editorial com aprovação e rastreabilidade jurídica
- Sem vínculo entre notícias e perfis de políticos

### 1.3 Objetivos de Negócio

- Tornar-se referência em jornalismo político digital no Brasil
- Garantir rigor editorial com rastreabilidade total de alterações
- Atingir excelência em SEO para notícias políticas
- Distribuição omnichannel integrada (web, newsletter, Telegram, WhatsApp)
- Escalar sem degradação de performance durante picos eleitorais

---

## 2. Personas

| Persona | Descrição | Necessidades Principais |
|---|---|---|
| **Leitor Político** | Cidadão 25-55 anos, escolaridade alta, acompanha política diariamente | Notícias confiáveis, rápidas, bem organizadas e sem poluição visual |
| **Repórter** | Jornalista da equipe, escreve e envia pautas | Interface de escrita eficiente, tags de políticos, salvamento automático |
| **Editor** | Responsável pela qualidade editorial | Kanban de workflow, aprovação rápida, sugestões de SEO |
| **Revisor Jurídico** | Advogado ou consultor que valida conteúdo sensível | Acesso segmentado para revisar notícias antes da publicação |
| **Administrador** | Gestor do sistema e da equipe | Controle de usuários, logs de auditoria, configurações gerais |

---

## 3. Requisitos Funcionais

### 3.1 Portal Público (Frontend)

#### Breaking News / Plantão
- Ticker de últimas notícias no topo da página em tempo real (via WebSocket ou polling)
- Banner de urgência máxima com destaque visual vermelho para notícias críticas
- Notificações push via PWA para assinantes cadastrados

#### Taxonomia Editorial
- Categorias primárias: Executivo, Legislativo, Judiciário, Economia, Internacional, Sustentabilidade, Direitos Civis
- Sub-categorias por região (estados e municípios)
- Tags livres e tags vinculadas a políticos cadastrados

#### Multiformatos de Conteúdo
- Player de podcasts embedado nativamente nos artigos
- Seção de vídeos curtos (Reels/Shorts) com player inline
- Newsletter integrada com cadastro e gestão de assinantes
- Galeria de fotos com lightbox

#### Acessibilidade
- Dark Mode com persistência de preferência via localStorage
- Botões de aumento/redução de fonte (A+ / A-)
- Leitura em áudio: integração com Web Speech API ou serviço TTS externo
- Conformidade WCAG 2.1 nível AA
- Atributos ARIA em todos os componentes interativos

#### Perfil de Político
- Página individual por político com: foto, partido, cargo, estado, biografia
- Feed automático de notícias vinculadas ao político
- Histórico de menções no portal

#### SEO & Performance
- Sitemap.xml dinâmico gerado automaticamente
- Open Graph Images dinâmicas com manchete + foto do político
- Schema.org NewsArticle para rich snippets no Google
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, FID < 100ms

---

### 3.2 ERP Editorial (Painel Administrativo)

#### Dashboard de Redação
- Contadores em tempo real: Rascunhos, Em Revisão, Publicados, Agendados
- Heatmap de audiência (notícias mais acessadas nas últimas 24h)
- Feed de alertas de pauta (integração com agências ou RSS externo)
- Notificações internas de workflow

#### Editor de Matéria
- Editor Rich Text (TipTap) com suporte a: headings, bold, italic, links, listas, tabelas
- Embeds nativos: YouTube, Instagram, X/Twitter, Spotify
- Citações destacadas (blockquote estilizado)
- Upload de mídia com integração ao DAM (Media Library)
- Barra lateral de SEO com checklist: tamanho do título, meta-description, alt-text, densidade de palavras-chave
- Campo "Políticos Mencionados" com autocomplete do CRM de Políticos
- Salvamento automático a cada 30 segundos

#### Workflow Editorial (Kanban)
- Colunas: Pauta → Apuração → Redação → Revisão Editorial → Revisão Jurídica → Publicado
- Drag & Drop entre colunas (somente para perfis com permissão)
- Atribuição de repórter pelo editor diretamente no card
- Comentários internos no card da matéria
- Sistema de notificações: alerta por e-mail e Telegram quando matéria muda de estágio

#### Gestão de Ativos (DAM)
- Upload de imagens e vídeos com metadados: legenda, créditos, direitos autorais
- Sugestão automática de tags via IA (integração com Gemini ou similar)
- Busca por metadados, tipo de arquivo e data de upload
- Prevenção de duplicatas por hash de arquivo

#### CRM de Fontes
- Cadastro sigiloso de fontes e contatos governamentais
- Níveis de acesso: apenas Admin e Editor podem visualizar fontes confidenciais
- Campos: nome, cargo, órgão, telefone, e-mail, nível de sigilo, histórico de contatos

#### CRM de Políticos
- Cadastro: nome, partido, cargo atual, estado, foto, bio
- Vínculo automático com notícias publicadas via tags
- Histórico de cobertura (quantas matérias, por qual repórter)

#### SEO em Tempo Real
- Sugestões de palavras-chave baseadas em trending topics (integração Google Trends API ou Serpstat)
- Análise de readability (Flesch-Kincaid adaptado para PT-BR)
- Preview de como o artigo aparece no Google Search

#### Fact-Checking
- Módulo de registro de fontes por matéria: URL externa, PDF, documento oficial
- Status de verificação: Verificado / Em Apuração / Contestado
- Vínculo com o artigo publicado (aparece como badge no portal)

#### Agendamento e Publicação
- Agendamento por data e hora exata
- Republicação automática nas redes sociais (integração via webhook)
- Histórico de republicações

#### Versionamento de Artigos
- Salvar snapshot da matéria a cada publicação e edição significativa
- Interface de diff (comparação lado a lado de versões)
- Quem alterou, quando e o quê (rastreabilidade total)

#### Logs de Auditoria
- Registro de todas as ações: criação, edição, exclusão, publicação, mudança de status
- Campos: user_id, ação, data_hora, IP, dado_anterior, dado_novo
- Exportação de logs em CSV para compliance

---

## 4. Requisitos Não-Funcionais

| Categoria | Requisito |
|---|---|
| **Performance** | Portal público: TTFB < 200ms via ISR/CDN; suporte a 100k req/min durante eleições |
| **Segurança** | MFA obrigatório para Editor e Admin; RBAC rigoroso; proteção DDoS via Cloudflare |
| **Disponibilidade** | SLA 99.9% uptime; arquitetura com failover automático |
| **Escalabilidade** | Auto-scaling horizontal (AWS ECS ou Vercel Edge) |
| **Acessibilidade** | WCAG 2.1 AA; suporte a leitores de tela (NVDA, VoiceOver) |
| **Conformidade** | LGPD: gestão de cookies, direito ao esquecimento, logs de consentimento |

---

## 5. Arquitetura Tecnológica

### 5.1 Stack Principal

| Camada | Tecnologia |
|---|---|
| **Frontend Portal** | Next.js 14+ (App Router), Tailwind CSS, Shadcn/ui |
| **Frontend ERP** | Next.js (Client-Side), Shadcn/ui, TanStack Query |
| **Editor de Texto** | TipTap (extensível, suporte a embeds) |
| **Backend API** | Next.js API Routes + Node.js microserviços |
| **ORM** | Prisma |
| **Banco de Dados** | PostgreSQL via Supabase |
| **Autenticação** | NextAuth.js com MFA (TOTP) |
| **Armazenamento** | Supabase Storage (imagens e vídeos) |
| **Cache** | Redis (Upstash) para contagem de views e breaking news |
| **CDN / Segurança** | Cloudflare (DDoS, WAF, cache de borda) |
| **Hospedagem** | Vercel (portal + ERP) |
| **Notificações** | Resend (e-mail), Telegram Bot API, WhatsApp Business API |
| **Monitoramento** | Vercel Analytics + Sentry |

### 5.2 Banco de Dados — Modelo Relacional

#### Tabelas Principais

```
Users           → id, nome, email, senha_hash, cargo_id, bio, redes_sociais, mfa_secret, status, created_at
Roles           → id, nome (reporter/editor/juridico/admin), permissoes (JSONB)
Articles        → id, titulo, slug, corpo_texto, resumo, autor_id, editor_id, revisor_id, categoria_id, status_id, data_publicacao, visualizacoes, og_image_url, created_at, updated_at
Article_Versions→ id, article_id, corpo_texto, editado_por, created_at
Categories      → id, nome, slug, esfera (executivo/legislativo/judiciário/...), cor, meta_description, parent_id
Politicians     → id, nome, partido, cargo_atual, estado, foto_url, bio, created_at
Article_Politicians → article_id, politician_id
Tags            → id, nome, slug
Article_Tags    → article_id, tag_id
Media_Library   → id, url, tipo, legenda, creditos, direitos_autorais, tags_ia (ARRAY), hash_arquivo, created_at
Sources_CRM     → id, nome, cargo, orgao, telefone, email, nivel_sigilo, notas, created_at
Fact_Checking   → id, article_id, fonte_url, documento_pdf_url, status_verificacao, verificado_por, created_at
Newsletters     → id, email, status, created_at
Activity_Logs   → id, user_id, acao, entidade, entidade_id, dado_anterior (JSONB), dado_novo (JSONB), ip, created_at
Breaking_News   → id, titulo, url_noticia, ativo, created_at, expires_at
Scheduled_Posts → id, article_id, plataforma, data_agendada, status, created_at
```

### 5.3 Arquitetura de Renderização

```
[Leitor] → [Cloudflare CDN] → [Vercel Edge]
                                    ↓
                           [Next.js App Router]
                          ┌────────────────────┐
                          │  SSR: Breaking News│
                          │  ISR: Artigos      │
                          │  SSG: Páginas fixas│
                          └────────────────────┘
                                    ↓
                           [Supabase PostgreSQL]
                           [Supabase Storage]
                           [Redis / Upstash]
```

---

## 6. Regras de Negócio

1. **Publicação**: Apenas Editor e Admin podem clicar em "Publicar". Repórteres só enviam para revisão.
2. **Versionamento**: Toda edição após publicação inicial cria um novo snapshot versionado.
3. **Fact-Checking**: Matérias de política interna exigem ao menos 1 fonte cadastrada no módulo antes de publicar.
4. **Sigilo de Fontes**: Apenas Admin e Editor têm acesso ao CRM de Fontes completo. Repórteres veem apenas fontes públicas.
5. **MFA Obrigatório**: Ao fazer login, Editor e Admin são redirecionados para configurar MFA se não estiver ativo.
6. **Auditoria**: Nenhum registro é deletado fisicamente. Exclusões são soft-delete com flag `deleted_at`.
7. **Breaking News**: Máximo de 10 itens ativos simultâneos no ticker. O mais antigo é removido automaticamente.
8. **Open Graph**: A OG Image é gerada dinamicamente na publicação com a manchete e foto do político vinculado.
9. **SEO Slug**: Slugs são gerados automaticamente no título e não podem ser alterados após publicação (apenas redirecionamento 301).
10. **Notificações de Urgência**: Matérias com tag "Plantão" disparam notificação imediata para canal Telegram da redação.

---

## 7. Módulos e Fases de Entrega

| Fase | Módulos | Prioridade |
|---|---|---|
| **Fase 0** | Infraestrutura Base, Banco de Dados, Autenticação | Crítica |
| **Fase 1** | ERP Core: Gestão de Artigos, Workflow Kanban, DAM | Alta |
| **Fase 2** | Portal Público: Home, Artigo, Categorias, Políticos | Alta |
| **Fase 3** | SEO Avançado, Breaking News, OG Images, Sitemap | Alta |
| **Fase 4** | CRM de Fontes, Fact-Checking, Logs de Auditoria | Média |
| **Fase 5** | Multiformatos: Podcast, Vídeo Curto, Newsletter | Média |
| **Fase 6** | Notificações (Telegram/Email), Webhooks, Agendamento | Média |
| **Fase 7** | Acessibilidade, Dark Mode, TTS, PWA | Média |
| **Fase 8** | IA: Sugestão de Tags DAM, SEO em Tempo Real | Baixa |

---

## 8. Critérios de Aceitação Globais

- [ ] Portal carrega em < 2s em conexão 4G (Lighthouse Performance > 90)
- [ ] Sistema ERP suporta 50 usuários simultâneos sem degradação
- [ ] Todas as rotas do ERP exigem autenticação válida
- [ ] MFA funcional para Editor e Admin
- [ ] Sitemap gerado e acessível em `/sitemap.xml`
- [ ] Dark Mode funcional em todas as páginas do portal
- [ ] Workflow completo: Repórter → Editor → Revisor → Publicação
- [ ] Logs de auditoria registram 100% das ações de escrita
- [ ] Open Graph Image gerada corretamente ao compartilhar no WhatsApp/X

---

## 9. Fora do Escopo (v1.0)

- Sistema de comentários dos leitores
- Paywall / conteúdo pago por assinatura
- App mobile nativo (iOS/Android) — somente PWA
- Integração com Google Analytics (apenas Vercel Analytics no início)
- Sistema de publicidade programática (AdSense/DFP)

---

*Documento gerado para o projeto Revista Gestão — Portal de Notícias Políticas*  
*Italo Jefferson — Desenvolvedor Full-Stack / Gerente de Projeto*
