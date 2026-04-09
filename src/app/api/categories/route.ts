import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Vercel Perf. Rule (Section 3/9): Cache at the network edge since categories rarely change
// Revalida automaticamente a cada 1 hora ou mediante tags
export const revalidate = 3600;

export async function GET() {
  try {
    // Vercel Perf. Rule (Section 2 - Payload): Selecionar apenas campos estritamente necessários
    const categories = await prisma.categoria.findMany({
      select: {
        id: true,
        nome: true,
        slug: true,
        cor: true,
        categoriaPaiId: true,
      },
      orderBy: {
        nome: "asc"
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao buscar categorias" }, 
      { status: 500 }
    );
  }
}
