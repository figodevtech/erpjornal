import { NextResponse } from "next/server";
import { obterSessao } from "@/lib/auth";

export async function GET() {
  const sessao = await obterSessao();

  if (!sessao) {
    return NextResponse.json({ sessao: null }, { status: 401 });
  }

  return NextResponse.json({ sessao });
}
