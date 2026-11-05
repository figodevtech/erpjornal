import "server-only";

import { STATUS_ARTIGO } from "@/lib/editorial/status";
import { MAX_PLANTOES_ATIVOS, destinoDoPlantao, type PlantaoPublico } from "@/lib/plantao";
import { prisma } from "@/lib/prisma";

/** Avisos no ar agora (ativos e dentro do prazo), do mais novo para o mais antigo. */
export async function listarPlantoesNoAr(agora = new Date()): Promise<PlantaoPublico[]> {
  const plantoes = await prisma.plantao.findMany({
    where: { ativo: true, OR: [{ expiraEm: null }, { expiraEm: { gt: agora } }] },
    orderBy: { criadoEm: "desc" },
    take: MAX_PLANTOES_ATIVOS,
    select: {
      id: true,
      texto: true,
      link: true,
      criadoEm: true,
      artigo: { select: { slug: true, status: true, dataPublicacao: true, excluidoEm: true } },
    },
  });

  return plantoes.map((plantao) => ({
    id: plantao.id,
    texto: plantao.texto,
    criadoEm: plantao.criadoEm.toISOString(),
    href: destinoDoPlantao({
      link: plantao.link,
      artigo: plantao.artigo
        ? {
            slug: plantao.artigo.slug,
            noAr:
              plantao.artigo.status === STATUS_ARTIGO.publicado &&
              plantao.artigo.excluidoEm === null &&
              plantao.artigo.dataPublicacao !== null &&
              plantao.artigo.dataPublicacao <= agora,
          }
        : null,
    }),
  }));
}
