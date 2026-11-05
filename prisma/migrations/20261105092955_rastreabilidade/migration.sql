-- Fase 5a: rastreabilidade (PRD).

-- Soft-delete: nenhum registro é apagado fisicamente.
ALTER TABLE "anuncios"   ADD COLUMN "excluido_em" TIMESTAMP(3);
ALTER TABLE "artigos"    ADD COLUMN "excluido_em" TIMESTAMP(3);
ALTER TABLE "categorias" ADD COLUMN "excluido_em" TIMESTAMP(3);
ALTER TABLE "fontes_rss" ADD COLUMN "excluido_em" TIMESTAMP(3);
ALTER TABLE "media_kits" ADD COLUMN "excluido_em" TIMESTAMP(3);
ALTER TABLE "politicos"  ADD COLUMN "excluido_em" TIMESTAMP(3);
ALTER TABLE "revistas"   ADD COLUMN "excluido_em" TIMESTAMP(3);

-- Checagem de fatos obrigatória por categoria.
ALTER TABLE "categorias" ADD COLUMN "exige_checagem" BOOLEAN NOT NULL DEFAULT false;

-- logs_acao -> logs_auditoria: renomeia (preserva o histórico) e amplia.
ALTER TABLE "logs_acao" RENAME TO "logs_auditoria";
ALTER TABLE "logs_auditoria" RENAME CONSTRAINT "logs_acao_pkey" TO "logs_auditoria_pkey";
ALTER TABLE "logs_auditoria" RENAME CONSTRAINT "logs_acao_artigo_id_fkey" TO "logs_auditoria_artigo_id_fkey";
ALTER TABLE "logs_auditoria" RENAME CONSTRAINT "logs_acao_usuario_id_fkey" TO "logs_auditoria_usuario_id_fkey";
ALTER TABLE "logs_auditoria" RENAME COLUMN "data_hora" TO "criado_em";
ALTER TABLE "logs_auditoria"
  ADD COLUMN "entidade" TEXT NOT NULL DEFAULT 'artigo',
  ADD COLUMN "entidade_id" UUID,
  ADD COLUMN "dado_anterior" JSONB,
  ADD COLUMN "dado_novo" JSONB,
  ADD COLUMN "ip" TEXT,
  ADD COLUMN "user_agent" TEXT;
UPDATE "logs_auditoria" SET "entidade_id" = "artigo_id" WHERE "artigo_id" IS NOT NULL;

CREATE INDEX "logs_auditoria_entidade_entidade_id_idx" ON "logs_auditoria"("entidade", "entidade_id");
CREATE INDEX "logs_auditoria_usuario_id_idx" ON "logs_auditoria"("usuario_id");
CREATE INDEX "logs_auditoria_criado_em_idx" ON "logs_auditoria"("criado_em");

-- Slugs antigos de matérias publicadas (301 para o slug atual).
CREATE TABLE "redirecionamentos_slug" (
    "slug_antigo" TEXT NOT NULL,
    "artigo_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "redirecionamentos_slug_pkey" PRIMARY KEY ("slug_antigo")
);
CREATE INDEX "redirecionamentos_slug_artigo_id_idx" ON "redirecionamentos_slug"("artigo_id");
ALTER TABLE "redirecionamentos_slug" ADD CONSTRAINT "redirecionamentos_slug_artigo_id_fkey"
  FOREIGN KEY ("artigo_id") REFERENCES "artigos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "redirecionamentos_slug" ENABLE ROW LEVEL SECURITY;
