"use server";

import { redis, redisKeys } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

/**
 * Incrementa as visualizações de um artigo de forma atômica no Redis.
 * Também atualiza o ranking de popularidade (Sorted Set).
 */
export async function incrementArticleViews(artigoId: string) {
  if (!artigoId) return;

  try {
    const key = redisKeys.artigoViews(artigoId);
    
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.zincrby(redisKeys.popularArticles, 1, artigoId);
    
    const [results] = await Promise.all([
      pipeline.exec(),
      prisma.artigo.update({
        where: { id: artigoId },
        data: { visualizacoes: { increment: 1 } }
      })
    ]);

    const newCount = results[0] as any;
    logger.info({ artigoId, count: newCount }, "Article view incremented [Redis + Postgres]");
    return typeof newCount === 'number' ? newCount : (newCount[1] ?? 0);
  } catch (error) {
    logger.error({ artigoId, error }, "Failed to increment artigo views");
    return null;
  }
}

/**
 * Recupera as visualizações atuais (Redis + Postgres fallback).
 */
export async function getArticleViews(artigoId: string) {
  try {
    const redisCount = await redis.get<number>(redisKeys.artigoViews(artigoId));
    if (redisCount !== null) return redisCount;

    // Fallback para o banco se o Redis rresetar ou a chave expirar
    const artigo = await prisma.artigo.findUnique({
      where: { id: artigoId },
      select: { visualizacoes: true }
    });
    
    return artigo?.visualizacoes || 0;
  } catch {
    return 0;
  }
}

/**
 * Busca os artigos mais populares baseados no score do Redis.
 */
export async function getPopularArticles(limit: number = 5) {
  try {
    // Busca do ranking (Sorted Set - Ordem Decrescente)
    const topIds = (await redis.zrange(redisKeys.popularArticles, 0, limit - 1, { rev: true })) as string[];

    if (!topIds || topIds.length === 0) {
      // FALLBACK OTIMIZADO: Evita Overfetching selecionando apenas campos leves
      return await prisma.artigo.findMany({
        where: { status: "publicado" },
        orderBy: { visualizacoes: "desc" },
        take: limit,
        select: {
          id: true,
          titulo: true,
          slug: true,
          resumo: true,
          dataPublicacao: true,
          urlImagemOg: true,
          categoria: {
            select: { nome: true, slug: true, cor: true }
          }
        }
      });
    }

    // Busca os dados completos no banco preservando a ordem do Redis
    const artigos = await prisma.artigo.findMany({
      where: { id: { in: topIds }, status: "publicado" },
      select: {
        id: true,
        titulo: true,
        slug: true,
        resumo: true,
        dataPublicacao: true,
        urlImagemOg: true,
        categoria: {
          select: { nome: true, slug: true, cor: true }
        }
      }
    });

    // Ordena de volta conforme o topIds
    return artigos.sort((a, b) => topIds.indexOf(a.id) - topIds.indexOf(b.id));
  } catch (error) {
    logger.error({ error }, "Erro ao buscar populares no Redis");
    return [];
  }
}
