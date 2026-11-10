-- Newsletter retomável, integridade referencial e índices de chave estrangeira.
--
-- 1. envios_newsletter ganha cursor (ultimo_inscrito_id) e "batimento" (atualizado_em):
--    um envio que parar no meio é retomado pelo cron a partir do último lote gravado.
-- 2. Apagar uma revista não apaga mais as matérias (SET NULL), e apagar um usuário
--    não apaga a trilha de auditoria dele (RESTRICT).
-- 3. Índices nas chaves estrangeiras usadas em consultas (o Postgres não cria sozinho).

-- DropForeignKey
ALTER TABLE "artigos" DROP CONSTRAINT "artigos_revista_id_fkey";

-- DropForeignKey
ALTER TABLE "logs_auditoria" DROP CONSTRAINT "logs_auditoria_usuario_id_fkey";

-- AlterTable
ALTER TABLE "envios_newsletter" ADD COLUMN     "atualizado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "ultimo_inscrito_id" UUID;

-- CreateIndex
CREATE INDEX "artigos_politicos_politico_id_idx" ON "artigos_politicos"("politico_id");

-- CreateIndex
CREATE INDEX "checagens_fato_artigo_id_idx" ON "checagens_fato"("artigo_id");

-- CreateIndex
CREATE INDEX "versoes_artigo_artigo_id_criado_em_idx" ON "versoes_artigo"("artigo_id", "criado_em");

-- CreateIndex
CREATE INDEX "notas_fonte_fonte_id_idx" ON "notas_fonte"("fonte_id");

-- CreateIndex
CREATE INDEX "envios_newsletter_status_atualizado_em_idx" ON "envios_newsletter"("status", "atualizado_em");

-- CreateIndex
CREATE INDEX "itens_rss_brutos_fonte_rss_id_idx" ON "itens_rss_brutos"("fonte_rss_id");

-- CreateIndex
CREATE INDEX "media_kit_sections_media_kit_id_ordem_idx" ON "media_kit_sections"("media_kit_id", "ordem");

-- AddForeignKey
ALTER TABLE "artigos" ADD CONSTRAINT "artigos_revista_id_fkey" FOREIGN KEY ("revista_id") REFERENCES "revistas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Envios que já estavam parados em "enviando" (código anterior, sem cursor) não
-- podem ser retomados do zero: as chaves de idempotência mudaram e quem já recebeu
-- receberia de novo. Ficam encerrados como interrompidos.
UPDATE "envios_newsletter"
SET "status" = CASE WHEN "enviados" > 0 THEN 'parcial' ELSE 'falhou' END,
    "erro" = 'Envio interrompido antes da retomada automática (encerrado na migração).',
    "concluido_em" = CURRENT_TIMESTAMP
WHERE "status" = 'enviando';
