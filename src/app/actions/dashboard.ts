"use server";

import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";
import { redis, redisKeys } from "@/lib/redis";
import logger from "@/lib/logger";

export type DashboardStats = {
  counts: {
    total: number;
    draft: number;
    published: number;
    scheduled: number;
  };
  popular: Array<{
    id: string;
    title: string;
    views: number;
    slug: string;
  }>;
};

/**
 * Coleta estatísticas gerais para o Dashboard Editorial.
 */
export async function getEditorialStats(): Promise<DashboardStats> {
  try {
    // 1. Contagem por Status no Postgres
    // Nota: No schema, o campo é status_id (String).
    const [total, draft, published, archived] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status_id: ArticleStatus.pauta } }),
      prisma.article.count({ where: { status_id: ArticleStatus.publicado } }), 
      prisma.article.count({ where: { status_id: ArticleStatus.arquivado } }),
    ]);

    // 2. Ranking de Audiência no Redis
    // No @upstash/redis v1.x, zrange com rev: true é o padrão moderno.
    // Mas zrevrange também funciona se o ambiente for coerente.
    // Usaremos zrange para compatibilidade máxima se zrevrange falhar no lint.
    const topIds = await redis.zrange(redisKeys.popularArticles, 0, 4, { rev: true, withScores: true });
    
    const popular = [];
    
    // Iterando sobre o retorno [member, score, member, score...]
    for (let i = 0; i < topIds.length; i += 2) {
      const id = topIds[i] as string;
      const score = Number(topIds[i + 1]);
      
      const article = await prisma.article.findUnique({
        where: { id },
        select: { titulo: true, slug: true }
      });
      
      if (article) {
        popular.push({ id, title: article.titulo, views: score, slug: article.slug });
      }
    }

    return {
      counts: { total, draft, published, scheduled: archived },
      popular: popular.sort((a, b) => b.views - a.views),
    };
  } catch (error) {
    logger.error({ error }, "Erro ao carregar estatísticas do Dashboard");
    return {
      counts: { total: 0, draft: 0, published: 0, scheduled: 0 },
      popular: [],
    };
  }
}
