import { NextResponse } from "next/server";

import { listarPlantoesNoAr } from "@/lib/data/plantao";

// Resposta em cache por 30s (ISR): a faixa consulta a cada 60s em cada navegador,
// mas o banco é lido no máximo duas vezes por minuto. Publicar ou encerrar um
// aviso no ERP invalida o cache na hora (revalidatePath).
export const revalidate = 30;

export async function GET() {
  try {
    return NextResponse.json({ plantoes: await listarPlantoesNoAr() });
  } catch (error) {
    console.error("GET /api/plantao:", error);
    return NextResponse.json({ plantoes: [] }, { status: 500 });
  }
}
