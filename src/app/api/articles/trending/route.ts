import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { ArticleStatus } from "@/lib/types/article-status";

const CACHE_KEY = "trending:artigos:v1";
const CACHE_TTL = 300; // 5 minutos

export async function GET() {
  try {
    // tenta cache
    const cached = await redis.get(CACHE_KEY).catch(() => null);
    if (cached) return NextResponse.json(cached);

    const artigos = await prisma.artigo.findMany({
      where: {
        status: ArticleStatus.publicado,
        dataPublicacao: { lte: new Date() },
        visualizacoes: { gt: 0 },
      },
      orderBy: { visualizacoes: "desc" },
      take: 6,
      select: {
        slug: true,
        titulo: true,
        visualizacoes: true,
        categoria: { select: { nome: true } },
      },
    });

    const response = {
      artigos: artigos.map((a) => ({
        slug: a.slug,
        titulo: a.titulo,
        visualizacoes: a.visualizacoes,
        categoria: a.categoria?.nome,
      })),
    };

    await redis.set(CACHE_KEY, response, { ex: CACHE_TTL }).catch(() => null);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Trending API error:", error);
    return NextResponse.json({ artigos: [] });
  }
}
