import "server-only";

import { cache } from "react";

import { STATUS_ARTIGO } from "@/lib/editorial/status";
import { prisma } from "@/lib/prisma";

/**
 * Filtro de "matéria visível no portal": publicada e com data de publicação
 * já alcançada (matérias agendadas ficam ocultas até a hora marcada).
 */
export function filtroArtigoNoAr(agora = new Date()) {
  return {
    status: STATUS_ARTIGO.publicado,
    dataPublicacao: { lte: agora },
  };
}

/**
 * Busca uma matéria visível no portal pelo slug.
 * Deduplicada por requisição (React cache): metadata e página compartilham a consulta.
 */
export const buscarArtigoPublicado = cache(async (slug: string) => {
  return prisma.artigo.findFirst({
    where: { slug, ...filtroArtigoNoAr() },
    include: {
      autor: true,
      categoria: true,
      itemRss: {
        include: {
          source: true,
        },
      },
      checagensFato: {
        select: { id: true, urlFonte: true, urlDocumento: true, statusVerificacao: true },
        orderBy: { criadoEm: "asc" },
      },
    },
  });
});

/**
 * Slug antigo de uma matéria publicada (o slug mudou depois da publicação):
 * devolve o slug atual para a página responder 301.
 */
export const buscarSlugAtual = cache(async (slugAntigo: string) => {
  const redirecionamento = await prisma.redirecionamentoSlug.findUnique({
    where: { slugAntigo },
    select: { artigoId: true },
  });
  if (!redirecionamento) return null;

  const artigo = await prisma.artigo.findFirst({
    where: { id: redirecionamento.artigoId, ...filtroArtigoNoAr() },
    select: { slug: true },
  });
  return artigo && artigo.slug !== slugAntigo ? artigo.slug : null;
});
