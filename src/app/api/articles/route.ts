import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Tratamento de paginação padrão
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const categorySlug = searchParams.get("category");

    const skip = (page - 1) * limit;

    // Apenas listamos matérias oficiais que já chegaram no horário configurado
    const whereClause: any = {
      status_id: "publicado",
      data_publicacao: {
        lte: new Date(),
      },
    };

    // Filtro relacional opcional para páginas de categoria específica
    if (categorySlug) {
      whereClause.categoria = {
        slug: categorySlug,
      };
    }

    // Processamento paralelo otimizado para não gargalar I/O
    const [articles, totalCount] = await Promise.all([
      prisma.article.findMany({
        where: whereClause,
        orderBy: {
          data_publicacao: "desc",
        },
        skip,
        take: limit,
        select: {
          id: true,
          titulo: true,
          slug: true,
          resumo: true,
          data_publicacao: true,
          visualizacoes: true,
          og_image_url: true,
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
      prisma.article.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: articles,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar listagem de artigos." },
      { status: 500 }
    );
  }
}
