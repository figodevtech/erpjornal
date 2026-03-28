import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { redis, redisKeys } from "@/lib/redis";

/**
 * Aplicando Regras da Vercel (Section 3: Server-side Performance):
 * Chamamos o Banco DIRETAMENTE de um Server Component para não criar um hop HTTP (Waterfall) na API Route.
 * Aplicando unstable_cache para edge caching agressivo de componentes que quase nunca mudam (Categorias).
 */
export const getCachedCategories = unstable_cache(
  async () => {
    // 1. Tenta buscar do Redis (Cache Distribuído)
    try {
      const cached = await redis.get<any[]>(redisKeys.categoryCache("all"));
      if (cached) return cached;
    } catch (e) {
      console.error("Redis Cache Error (Categories):", e);
    }

    // 2. Fallback para Database
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        nome: true,
        slug: true,
      },
      orderBy: {
        nome: "asc",
      },
    });

    // 3. Salva no Redis por 1 hora
    try {
      await redis.set(redisKeys.categoryCache("all"), categories, { ex: 3600 });
    } catch (e) {}

    return categories;
  },
  ["public-categories"],
  {
    revalidate: 3600, // Sync com o TTL do Redis
  }
);
