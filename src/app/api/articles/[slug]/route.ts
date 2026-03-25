import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> } // Em Next.js 15, os parâmetros da rota dinâmica são consumidos por Promise
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    if (!slug) {
      return NextResponse.json({ error: "Slug da matéria não fornecido" }, { status: 400 });
    }

    // Busca detalhada apenas de matéria pública
    const article = await prisma.article.findFirst({
      where: {
        slug,
        status_id: "publicado",
        data_publicacao: {
          lte: new Date(),
        },
      },
      select: {
        id: true,
        titulo: true,
        resumo: true,
        corpo_texto: true,
        slug: true,
        data_publicacao: true,
        visualizacoes: true,
        og_image_url: true,
        categoria: {
          select: {
            nome: true,
            slug: true,
            cor: true,
          }
        },
        autor: {
          select: {
            nome: true,
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json({ error: "Matéria não encontrada ou indisponível" }, { status: 404 });
    }

    // Incrementa contagem de views de forma Background fire-and-forget (não-bloqueante na requisição principal)
    prisma.article.update({
      where: { id: article.id },
      data: { visualizacoes: { increment: 1 } }
    }).catch(err => console.error("Falha silenciosa ao incrementar view da matéria:", err));

    return NextResponse.json(article);

  } catch (error) {
    console.error("GET /api/articles/[slug] error:", error);
    return NextResponse.json({ error: "Erro interno no servidor ao consumir a matéria" }, { status: 500 });
  }
}
