-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "status_artigo" AS ENUM ('pauta', 'apuracao', 'redacao', 'revisao', 'juridico', 'publicado', 'arquivado');

-- CreateEnum
CREATE TYPE "media_kit_status" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "nome" TEXT,
    "email" TEXT,
    "tipo_conta" TEXT NOT NULL DEFAULT 'portal',
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "avatar_url" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissoes" (
    "id" UUID NOT NULL,
    "modulo" TEXT NOT NULL,
    "acao" TEXT NOT NULL,
    "descricao" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_perfis" (
    "usuario_id" UUID NOT NULL,
    "perfil_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_perfis_pkey" PRIMARY KEY ("usuario_id","perfil_id")
);

-- CreateTable
CREATE TABLE "perfis_permissoes" (
    "perfil_id" UUID NOT NULL,
    "permissao_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfis_permissoes_pkey" PRIMARY KEY ("perfil_id","permissao_id")
);

-- CreateTable
CREATE TABLE "artigos" (
    "id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "corpo_texto" TEXT NOT NULL,
    "resumo" TEXT,
    "autor_id" UUID NOT NULL,
    "editor_id" UUID,
    "revisor_id" UUID,
    "categoria_id" UUID,
    "status" "status_artigo" NOT NULL DEFAULT 'pauta',
    "data_publicacao" TIMESTAMP(3),
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "url_imagem_og" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,
    "estado" TEXT,
    "observacoes_legais" TEXT,
    "status_legal" TEXT NOT NULL DEFAULT 'pendente',
    "regiao" TEXT,
    "eh_premium" BOOLEAN NOT NULL DEFAULT false,
    "canais_publicacao" TEXT[] DEFAULT ARRAY['portal']::TEXT[],
    "autor_externo" TEXT,
    "url_fonte" TEXT,
    "revisor_humano" TEXT,
    "item_rss_id" UUID,
    "revista_id" UUID,
    "ordem_revista" INTEGER,

    CONSTRAINT "artigos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revistas" (
    "id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "edicao" TEXT NOT NULL,
    "data_publicacao" TIMESTAMP(3),
    "capa_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "politicos" (
    "id" UUID NOT NULL,
    "nome" TEXT,
    "cpf" TEXT,
    "cnpj" TEXT,
    "categoria_entidade" TEXT,
    "cargo" TEXT,
    "partido" TEXT,
    "biografia" TEXT,
    "url_foto" TEXT,
    "regiao" TEXT,
    "estado" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "politicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artigos_politicos" (
    "artigo_id" UUID NOT NULL,
    "politico_id" UUID NOT NULL,
    "papel" TEXT,

    CONSTRAINT "artigos_politicos_pkey" PRIMARY KEY ("artigo_id","politico_id")
);

-- CreateTable
CREATE TABLE "checagens_fato" (
    "id" UUID NOT NULL,
    "artigo_id" UUID NOT NULL,
    "url_fonte" TEXT,
    "url_documento" TEXT,
    "status_verificacao" TEXT NOT NULL DEFAULT 'verificado',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checagens_fato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "versoes_artigo" (
    "id" UUID NOT NULL,
    "artigo_id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumo" TEXT,
    "corpo_texto" TEXT NOT NULL,
    "status" "status_artigo" NOT NULL,
    "usuario_id" UUID,
    "resumo_mudancas" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "versoes_artigo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "esfera" TEXT,
    "cor" TEXT,
    "meta_descricao" TEXT,
    "categoria_pai_id" UUID,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_acao" (
    "id" UUID NOT NULL,
    "usuario_id" UUID NOT NULL,
    "acao" TEXT NOT NULL,
    "artigo_id" UUID,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_acao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "midias" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "mime_type" TEXT,
    "tamanho" INTEGER,
    "direitos_autorais" TEXT,
    "tipo_licenca" TEXT,
    "fonte" TEXT,
    "data_expiracao" TIMESTAMP(3),
    "tags_ia" JSONB,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "midias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anuncios" (
    "id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "imagem_url" TEXT NOT NULL,
    "link_url" TEXT NOT NULL,
    "alt_text" TEXT,
    "tamanho" TEXT NOT NULL DEFAULT 'banner_horizontal',
    "paginas" TEXT[] DEFAULT ARRAY['home']::TEXT[],
    "posicoes" TEXT[] DEFAULT ARRAY['topo']::TEXT[],
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "prioridade" INTEGER NOT NULL DEFAULT 0,
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anuncios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fontes" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT,
    "organizacao" TEXT,
    "email" TEXT,
    "telefone" TEXT,
    "nivel_sigilo" TEXT NOT NULL DEFAULT 'publico',
    "notas" TEXT,
    "criador_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fontes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_fonte" (
    "id" UUID NOT NULL,
    "fonte_id" UUID NOT NULL,
    "autor_id" UUID NOT NULL,
    "conteudo" TEXT NOT NULL,
    "artigo_id" UUID,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_fonte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "episodios_podcast" (
    "id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "url_audio" TEXT NOT NULL,
    "url_capa" TEXT,
    "duracao" INTEGER,
    "data_pub" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "episodios_podcast_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos_curtos" (
    "id" UUID NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "url_video" TEXT NOT NULL,
    "url_capa" TEXT,
    "duracao" INTEGER,
    "data_pub" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'draft',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_curtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inscricoes_newsletter" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT,
    "temas" TEXT[],
    "origem" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscricoes_newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_configuracoes" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "uso_geracao_artigos" INTEGER NOT NULL DEFAULT 0,
    "uso_geracao_imagens" INTEGER NOT NULL DEFAULT 0,
    "limite_geracao_artigos" INTEGER NOT NULL DEFAULT 100,
    "limite_geracao_imagens" INTEGER NOT NULL DEFAULT 100,
    "modelo_reescrita_artigos" TEXT NOT NULL DEFAULT 'gpt-5.4-mini',
    "modelo_geracao_imagens" TEXT NOT NULL DEFAULT 'gpt-image-2',
    "tamanho_geracao_imagens" TEXT NOT NULL DEFAULT '1536x1024',
    "qualidade_geracao_imagens" TEXT NOT NULL DEFAULT 'high',
    "barra_mercado_ativa" BOOLEAN NOT NULL DEFAULT true,
    "mes_vigente_contagem" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_configuracoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fontes_rss" (
    "id" UUID NOT NULL,
    "url_feed" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "logo" TEXT,
    "tom" TEXT,
    "cache_ttl" INTEGER NOT NULL DEFAULT 30,
    "regiao" TEXT,
    "estado" TEXT,
    "ultimo_harvest" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ativa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "fontes_rss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_rss_brutos" (
    "id" UUID NOT NULL,
    "fonte_rss_id" UUID NOT NULL,
    "guid" TEXT,
    "titulo_original" TEXT NOT NULL,
    "link_original" TEXT NOT NULL,
    "autor_original" TEXT,
    "descricao" TEXT,
    "miniatura" TEXT,
    "data_publicacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "itens_rss_brutos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_reescrita" (
    "id" UUID NOT NULL,
    "item_rss_id" UUID NOT NULL,
    "prompt_ia" TEXT,
    "resposta_ia" JSONB,
    "alteracoes_humanas" JSONB,
    "horario_aprovacao" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_reescrita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_kits" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "media_kit_status" NOT NULL DEFAULT 'DRAFT',
    "tema" JSONB,
    "idioma" TEXT NOT NULL DEFAULT 'pt-BR',
    "publicado_em" TIMESTAMP(3),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_kits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_kit_sections" (
    "id" UUID NOT NULL,
    "media_kit_id" UUID NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT,
    "ordem" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_kit_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_kit_versions" (
    "id" UUID NOT NULL,
    "media_kit_id" UUID NOT NULL,
    "snapshot" JSONB NOT NULL,
    "usuario_id" UUID,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_kit_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_kit_assets" (
    "id" UUID NOT NULL,
    "media_kit_id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" TEXT,
    "tipo" TEXT NOT NULL,
    "tamanho" INTEGER,
    "dimensoes" TEXT,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_kit_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_nome_key" ON "perfis"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "permissoes_modulo_acao_key" ON "permissoes"("modulo", "acao");

-- CreateIndex
CREATE UNIQUE INDEX "artigos_slug_key" ON "artigos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "artigos_item_rss_id_key" ON "artigos"("item_rss_id");

-- CreateIndex
CREATE INDEX "artigos_status_data_publicacao_idx" ON "artigos"("status", "data_publicacao");

-- CreateIndex
CREATE INDEX "artigos_categoria_id_idx" ON "artigos"("categoria_id");

-- CreateIndex
CREATE INDEX "artigos_revista_id_ordem_revista_idx" ON "artigos"("revista_id", "ordem_revista");

-- CreateIndex
CREATE UNIQUE INDEX "politicos_cpf_key" ON "politicos"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "politicos_cnpj_key" ON "politicos"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE INDEX "anuncios_ativo_data_fim_idx" ON "anuncios"("ativo", "data_fim");

-- CreateIndex
CREATE UNIQUE INDEX "episodios_podcast_slug_key" ON "episodios_podcast"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "videos_curtos_slug_key" ON "videos_curtos"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "inscricoes_newsletter_email_key" ON "inscricoes_newsletter"("email");

-- CreateIndex
CREATE UNIQUE INDEX "fontes_rss_url_feed_key" ON "fontes_rss"("url_feed");

-- CreateIndex
CREATE UNIQUE INDEX "itens_rss_brutos_guid_key" ON "itens_rss_brutos"("guid");

-- CreateIndex
CREATE UNIQUE INDEX "media_kits_slug_key" ON "media_kits"("slug");

-- AddForeignKey
ALTER TABLE "usuarios_perfis" ADD CONSTRAINT "usuarios_perfis_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_perfis" ADD CONSTRAINT "usuarios_perfis_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_permissoes" ADD CONSTRAINT "perfis_permissoes_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "perfis_permissoes" ADD CONSTRAINT "perfis_permissoes_permissao_id_fkey" FOREIGN KEY ("permissao_id") REFERENCES "permissoes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_editor_id_fkey" FOREIGN KEY ("editor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_revisor_id_fkey" FOREIGN KEY ("revisor_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_item_rss_id_fkey" FOREIGN KEY ("item_rss_id") REFERENCES "itens_rss_brutos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_revista_id_fkey" FOREIGN KEY ("revista_id") REFERENCES "revistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos_politicos" ADD CONSTRAINT "artigos_politicos_artigo_id_fkey" FOREIGN KEY ("artigo_id") REFERENCES "artigos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos_politicos" ADD CONSTRAINT "artigos_politicos_politico_id_fkey" FOREIGN KEY ("politico_id") REFERENCES "politicos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checagens_fato" ADD CONSTRAINT "checagens_fato_artigo_id_fkey" FOREIGN KEY ("artigo_id") REFERENCES "artigos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versoes_artigo" ADD CONSTRAINT "versoes_artigo_artigo_id_fkey" FOREIGN KEY ("artigo_id") REFERENCES "artigos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "versoes_artigo" ADD CONSTRAINT "versoes_artigo_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_categoria_pai_id_fkey" FOREIGN KEY ("categoria_pai_id") REFERENCES "categorias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_acao" ADD CONSTRAINT "logs_acao_artigo_id_fkey" FOREIGN KEY ("artigo_id") REFERENCES "artigos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_acao" ADD CONSTRAINT "logs_acao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fontes" ADD CONSTRAINT "fontes_criador_id_fkey" FOREIGN KEY ("criador_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_fonte" ADD CONSTRAINT "notas_fonte_artigo_id_fkey" FOREIGN KEY ("artigo_id") REFERENCES "artigos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_fonte" ADD CONSTRAINT "notas_fonte_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_fonte" ADD CONSTRAINT "notas_fonte_fonte_id_fkey" FOREIGN KEY ("fonte_id") REFERENCES "fontes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_rss_brutos" ADD CONSTRAINT "itens_rss_brutos_fonte_rss_id_fkey" FOREIGN KEY ("fonte_rss_id") REFERENCES "fontes_rss"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_reescrita" ADD CONSTRAINT "logs_reescrita_item_rss_id_fkey" FOREIGN KEY ("item_rss_id") REFERENCES "itens_rss_brutos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_kit_sections" ADD CONSTRAINT "media_kit_sections_media_kit_id_fkey" FOREIGN KEY ("media_kit_id") REFERENCES "media_kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_kit_versions" ADD CONSTRAINT "media_kit_versions_media_kit_id_fkey" FOREIGN KEY ("media_kit_id") REFERENCES "media_kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_kit_versions" ADD CONSTRAINT "media_kit_versions_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_kit_assets" ADD CONSTRAINT "media_kit_assets_media_kit_id_fkey" FOREIGN KEY ("media_kit_id") REFERENCES "media_kits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

