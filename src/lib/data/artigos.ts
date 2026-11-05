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
    },
  });
});
