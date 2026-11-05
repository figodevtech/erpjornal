-- AlterTable
ALTER TABLE "inscricoes_newsletter" ADD COLUMN     "confirmacao_enviada_em" TIMESTAMP(3),
ADD COLUMN     "confirmado_em" TIMESTAMP(3),
ADD COLUMN     "descadastrado_em" TIMESTAMP(3),
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pendente',
ADD COLUMN     "token" TEXT NOT NULL DEFAULT gen_random_uuid()::text;

-- CreateTable
CREATE TABLE "envios_newsletter" (
    "id" UUID NOT NULL,
    "artigo_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'enviando',
    "destinatarios" INTEGER NOT NULL DEFAULT 0,
    "enviados" INTEGER NOT NULL DEFAULT 0,
    "erro" TEXT,
    "iniciado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "concluido_em" TIMESTAMP(3),

    CONSTRAINT "envios_newsletter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "envios_newsletter_artigo_id_key" ON "envios_newsletter"("artigo_id");

-- CreateIndex
CREATE UNIQUE INDEX "inscricoes_newsletter_token_key" ON "inscricoes_newsletter"("token");

-- CreateIndex
CREATE INDEX "inscricoes_newsletter_status_idx" ON "inscricoes_newsletter"("status");

-- AddForeignKey
ALTER TABLE "envios_newsletter" ADD CONSTRAINT "envios_newsletter_artigo_id_fkey" FOREIGN KEY ("artigo_id") REFERENCES "artigos"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Inscritos antigos ganharam um token aleatório acima; daqui em diante o app gera o token.
ALTER TABLE "inscricoes_newsletter" ALTER COLUMN "token" DROP DEFAULT;

-- Inscrições anteriores à dupla confirmação continuam "pendente": só recebem a
-- newsletter depois de confirmar pelo e-mail (LGPD).

-- Mesma regra das demais tabelas: RLS ligado, sem policies (só o Prisma acessa).
ALTER TABLE "envios_newsletter" ENABLE ROW LEVEL SECURITY;
