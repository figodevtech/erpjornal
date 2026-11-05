-- AlterTable
ALTER TABLE "politicos" ADD COLUMN     "slug" TEXT;

-- CreateTable
CREATE TABLE "plantoes" (
    "id" UUID NOT NULL,
    "texto" TEXT NOT NULL,
    "artigo_id" UUID,
    "link" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "expira_em" TIMESTAMP(3),
    "autor_id" UUID NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plantoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "artigos_tags" (
    "artigo_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "artigos_tags_pkey" PRIMARY KEY ("artigo_id","tag_id")
);

-- CreateIndex
CREATE INDEX "plantoes_ativo_criado_em_idx" ON "plantoes"("ativo", "criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "artigos_tags_tag_id_idx" ON "artigos_tags"("tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "politicos_slug_key" ON "politicos"("slug");

-- AddForeignKey
ALTER TABLE "plantoes" ADD CONSTRAINT "plantoes_artigo_id_fkey" FOREIGN KEY ("artigo_id") REFERENCES "artigos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantoes" ADD CONSTRAINT "plantoes_autor_id_fkey" FOREIGN KEY ("autor_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos_tags" ADD CONSTRAINT "artigos_tags_artigo_id_fkey" FOREIGN KEY ("artigo_id") REFERENCES "artigos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artigos_tags" ADD CONSTRAINT "artigos_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Slugs dos políticos já cadastrados (o app gera os novos). Sem acento, minúsculo,
-- hífens; nomes repetidos ganham sufixo -2, -3...
WITH bases AS (
  SELECT
    id,
    criado_em,
    COALESCE(
      NULLIF(
        left(trim(BOTH '-' FROM regexp_replace(
          lower(translate(COALESCE(nome, ''),
            'áàâãäéèêëíìîïóòôõöúùûüçñÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ',
            'aaaaaeeeeiiiiooooouuuucnAAAAAEEEEIIIIOOOOOUUUUCN')),
          '[^a-z0-9]+', '-', 'g')), 80),
        ''),
      'entidade') AS base
  FROM "politicos"
),
numerados AS (
  SELECT id, base, row_number() OVER (PARTITION BY base ORDER BY criado_em, id) AS n FROM bases
)
UPDATE "politicos" p
SET "slug" = CASE WHEN numerados.n = 1 THEN numerados.base ELSE numerados.base || '-' || numerados.n END
FROM numerados
WHERE p.id = numerados.id;

-- Mesma regra das demais tabelas: RLS ligado, sem policies (só o Prisma acessa).
ALTER TABLE "plantoes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "artigos_tags" ENABLE ROW LEVEL SECURITY;
