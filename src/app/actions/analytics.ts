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
    
    // REDIS PIPELINE: Reduz latência de rede agrupando comandos
    const pipeline = redis.pipeline();
    pipeline.incr(key);
    pipeline.zadd(redisKeys.popularArticles, { score: 1, member: articleId }); // Incrementa score no Sorted Set
    
    const results = await pipeline.exec();
    const newCount = results[0] as number;

    logger.info({ articleId, count: newCount }, "Article view incremented [Redis Pipeline]");
    
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
      // FALLBACK OTIMIZADO: Evita Overfetching selecionando apenas campos leves
      return await prisma.article.findMany({
        where: { status_id: "publicado" },
        orderBy: { visualizacoes: "desc" },
        take: limit,
        select: {
          id: true,
          titulo: true,
          slug: true,
          resumo: true,
          data_publicacao: true,
          og_image_url: true,
          categoria: {
            select: { nome: true, slug: true, cor: true }
          }
        }
      });
    }

    // Busca os dados completos no banco preservando a ordem do Redis
    const articles = await prisma.article.findMany({
      where: { id: { in: topIds }, status_id: "publicado" },
      select: {
        id: true,
        titulo: true,
        slug: true,
        resumo: true,
        data_publicacao: true,
        og_image_url: true,
        categoria: {
          select: { nome: true, slug: true, cor: true }
        }
      }
    });

    // Ordena de volta conforme o topIds
    return articles.sort((a, b) => topIds.indexOf(a.id) - topIds.indexOf(b.id));
  } catch (error) {
    logger.error({ error }, "Erro ao buscar populares no Redis");
    return [];
  }
}
