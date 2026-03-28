"use server";

import { redis, redisKeys } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import logger from "@/lib/logger";

/**
 * Incrementa as visualizações de um artigo de forma atômica no Redis.
 * Também atualiza o ranking de popularidade (Sorted Set).
 */
export async function incrementArticleViews(articleId: string) {
  if (!articleId) return;

  try {
    const key = redisKeys.articleViews(articleId);
    
    // 1. Incrementa no Redis (Atômico e Rápido)
    const newCount = await redis.incr(key);

    // 2. Atualiza o Ranking do Sorted Set
    await redis.zadd(redisKeys.popularArticles, { score: newCount, member: articleId });

    logger.info({ articleId, count: newCount }, "Article view incremented [Redis]");
    
    return newCount;
  } catch (error) {
    logger.error({ articleId, error }, "Failed to increment article views");
    return null;
  }
}

/**
 * Recupera as visualizações atuais (Redis + Postgres fallback).
 */
export async function getArticleViews(articleId: string) {
  try {
    const redisCount = await redis.get<number>(redisKeys.articleViews(articleId));
    if (redisCount !== null) return redisCount;

    // Fallback para o banco se o Redis rresetar ou a chave expirar
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { visualizacoes: true }
    });
    
    return article?.visualizacoes || 0;
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
    const topIds = await redis.zrange<string[]>(redisKeys.popularArticles, 0, limit - 1, { rev: true });

    if (!topIds || topIds.length === 0) {
      // Fallback: busca por visualizações no banco se Redis estiver vazio
      return await prisma.article.findMany({
        where: { status_id: "publicado" },
        orderBy: { visualizacoes: "desc" },
        take: limit,
        include: { categoria: true }
      });
    }

    // Busca os dados completos no banco preservando a ordem do Redis
    const articles = await prisma.article.findMany({
      where: { id: { in: topIds }, status_id: "publicado" },
      include: { categoria: true }
    });

    // Ordena de volta conforme o topIds
    return articles.sort((a, b) => topIds.indexOf(a.id) - topIds.indexOf(b.id));
  } catch (error) {
    console.error("Erro ao buscar populares no Redis:", error);
    return [];
  }
}
