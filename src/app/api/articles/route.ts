import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ArticleStatus } from "@/lib/types/article-status";
import { redis, redisKeys } from "@/lib/redis";
import { globalRateLimit, getIP } from "@/lib/ratelimit";

export async function GET(request: Request) {
  try {
    // --- RATE LIMIT GLOBAL ---
    const ip = getIP(request);
    const { success } = await globalRateLimit.limit(ip);
    if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    // -------------------------

    const { searchParams } = new URL(request.url);
    
    // Tratamento de paginação padrão
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const categorySlug = searchParams.get("category");

    const skip = (page - 1) * limit;

    // Apenas listamos matérias oficiais que já chegaram no horário configurado
    const whereClause: Prisma.ArtigoWhereInput = {
      status: ArticleStatus.publicado,
      dataPublicacao: {
        lte: new Date(),
      },
    };

    // --- CAMADA DE CACHE REDIS ---
    const cacheKey = redisKeys.artigosList(page, limit, categorySlug || undefined);
    
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`[Cache Hit] Articles list for key: ${cacheKey}`);
        return NextResponse.json(cachedData);
      }
    } catch (cacheError) {
      console.error("Redis Cache Error:", cacheError);
      // Continua para o banco se o Redis falhar
    }
    // ----------------------------

    // Filtro relacional opcional para páginas de categoria específica
    if (categorySlug) {
      whereClause.categoria = {
        slug: categorySlug,
      };
    }

    // Processamento paralelo otimizado para não gargalar I/O
    const [artigos, totalCount] = await Promise.all([
      prisma.artigo.findMany({
        where: whereClause,
        orderBy: {
          dataPublicacao: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          titulo: true,
          slug: true,
          resumo: true,
          dataPublicacao: true,
          visualizacoes: true,
          urlImagemOg: true,
          categoria: {
            select: {
              id: true,
              nome: true,
              slug: true,
              cor: true,
            },
          },
          autor: {
            select: {
              nome: true,
            },
          },
        },
      }),
      prisma.artigo.count({ where: whereClause }),
    ]);

    const responseData = {
      data: artigos,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };

    // Salva no cache por 5 minutos (300s) para reduzir carga no banco
    try {
      await redis.set(cacheKey, responseData, { ex: 300 });
    } catch (cacheError) {
      console.error("Failed to set Redis cache:", cacheError);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("GET /api/artigos error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar listagem de artigos." },
      { status: 500 }
    );
  }
}
