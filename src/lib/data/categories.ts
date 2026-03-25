import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Aplicando Regras da Vercel (Section 3: Server-side Performance):
 * Chamamos o Banco DIRETAMENTE de um Server Component para não criar um hop HTTP (Waterfall) na API Route.
 * Aplicando unstable_cache para edge caching agressivo de componentes que quase nunca mudam (Categorias).
 */
export const getCachedCategories = unstable_cache(
  async () => {
    return await prisma.category.findMany({
      select: {
        id: true,
        nome: true,
        slug: true,
      },
      orderBy: {
        nome: "asc",
      },
    });
  },
  ["public-categories"],
  {
    revalidate: 3600, // 1 hora de vida no cache
  }
);
