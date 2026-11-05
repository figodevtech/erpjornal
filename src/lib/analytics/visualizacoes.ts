import "server-only";

import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { redis, redisKeys } from "@/lib/redis";

/**
 * Contagem de visualizações (Redis + Postgres).
 *
 * Módulo de servidor comum (não é "use server"): antes estas funções eram
 * server actions públicas e qualquer um podia inflar as views em loop.
 * O registro agora passa por POST /api/articles/[slug]/view, com rate limit.
 */

export async function registrarVisualizacao(artigoId: string): Promise<number | null> {
  try {
    const pipeline = redis.pipeline();
    pipeline.incr(redisKeys.artigoViews(artigoId));
    pipeline.zincrby(redisKeys.popularArticles, 1, artigoId);

    const [resultados] = await Promise.all([
      pipeline.exec(),
      prisma.artigo.update({
        where: { id: artigoId },
        data: { visualizacoes: { increment: 1 } },
      }),
    ]);

    const [, contagem] = resultados[0] ?? [];
    return typeof contagem === "number" ? contagem : null;
  } catch (error) {
    logger.error({ artigoId, error }, "Falha ao registrar visualização");
    return null;
  }
}

/** Visualizações atuais: Redis, com o Postgres como fallback. */
export async function obterVisualizacoes(artigoId: string): Promise<number> {
  try {
    const noRedis = await redis.get<number>(redisKeys.artigoViews(artigoId));
    if (typeof noRedis === "number" && noRedis > 0) return noRedis;

    const artigo = await prisma.artigo.findUnique({
      where: { id: artigoId },
      select: { visualizacoes: true },
    });
    return artigo?.visualizacoes ?? 0;
  } catch {
    return 0;
  }
}
