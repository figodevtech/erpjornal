import { Redis } from "@upstash/redis";

/**
 * Cliente Redis (Upstash) para cache e contadores atômicos.
 * Requer as variáveis de ambiente UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.
 */
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

/**
 * Helper para gerar chaves do Redis padronizadas.
 */
export const redisKeys = {
  articleViews: (id: string) => `article:${id}:views`,
  popularArticles: "portal:popular_articles",
  categoryCache: (slug: string) => `category:${slug}:cache`,
  articlesList: (page: number, limit: number, category?: string) => `articles:list:${page}:${limit}:${category || 'all'}`,
  globalStats: "portal:stats",
};
