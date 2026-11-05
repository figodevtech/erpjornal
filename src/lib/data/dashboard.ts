import "server-only";

import type { StatusArtigo } from "@/generated/prisma/enums";
import { STATUS_ARTIGO } from "@/lib/editorial/status";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { redis, redisKeys } from "@/lib/redis";

export type EstatisticasEditoriais = {
  contagens: {
    total: number;
    /** pauta + apuração + redação */
    emProducao: number;
    /** revisão + jurídico */
    emRevisao: number;
    /** publicadas e já no ar */
    publicadas: number;
    /** publicadas com data futura */
    agendadas: number;
    porEtapa: Record<StatusArtigo, number>;
  };
  populares: Array<{ id: string; titulo: string; slug: string; visualizacoes: number }>;
};

const VAZIO: EstatisticasEditoriais = {
  contagens: {
    total: 0,
    emProducao: 0,
    emRevisao: 0,
    publicadas: 0,
    agendadas: 0,
    porEtapa: { pauta: 0, apuracao: 0, redacao: 0, revisao: 0, juridico: 0, publicado: 0, arquivado: 0 },
  },
  populares: [],
};

/** Mais lidas: ranking do Redis; sem Redis (ou vazio), usa a contagem do Postgres. */
async function buscarPopulares(limite = 5): Promise<EstatisticasEditoriais["populares"]> {
  const ranking = (await redis
    .zrange(redisKeys.popularArticles, 0, limite - 1, { rev: true, withScores: true })
    .catch(() => [])) as Array<string | number>;

  if (ranking.length > 0) {
    const pontuacao = new Map<string, number>();
    for (let i = 0; i < ranking.length; i += 2) pontuacao.set(String(ranking[i]), Number(ranking[i + 1]));

    // Uma consulta só (antes era uma por artigo do ranking).
    const artigos = await prisma.artigo.findMany({
      where: { id: { in: [...pontuacao.keys()] } },
      select: { id: true, titulo: true, slug: true },
    });
    return artigos
      .map((artigo) => ({ ...artigo, visualizacoes: pontuacao.get(artigo.id) ?? 0 }))
      .sort((a, b) => b.visualizacoes - a.visualizacoes);
  }

  return prisma.artigo.findMany({
    where: { status: STATUS_ARTIGO.publicado, visualizacoes: { gt: 0 } },
    orderBy: { visualizacoes: "desc" },
    take: limite,
    select: { id: true, titulo: true, slug: true, visualizacoes: true },
  });
}

/** Indicadores do painel editorial (um groupBy + uma contagem + o ranking). */
export async function obterEstatisticasEditoriais(): Promise<EstatisticasEditoriais> {
  try {
    const agora = new Date();
    const [grupos, agendadas, populares] = await Promise.all([
      prisma.artigo.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.artigo.count({ where: { status: STATUS_ARTIGO.publicado, dataPublicacao: { gt: agora } } }),
      buscarPopulares(),
    ]);

    const porEtapa = { ...VAZIO.contagens.porEtapa };
    for (const grupo of grupos) porEtapa[grupo.status] = grupo._count._all;

    const total = Object.values(porEtapa).reduce((soma, valor) => soma + valor, 0);
    return {
      contagens: {
        total,
        emProducao: porEtapa.pauta + porEtapa.apuracao + porEtapa.redacao,
        emRevisao: porEtapa.revisao + porEtapa.juridico,
        publicadas: porEtapa.publicado - agendadas,
        agendadas,
        porEtapa,
      },
      populares,
    };
  } catch (error) {
    logger.error({ error }, "Erro ao carregar estatísticas do painel editorial");
    return VAZIO;
  }
}
