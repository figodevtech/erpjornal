import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { dispararNewsletterPendentes } from "@/lib/newsletter/disparo";

const SEM_CACHE = { "Cache-Control": "private, no-store" };

// O envio pode levar alguns segundos por lote.
export const maxDuration = 60;

function autorizado(cabecalho: string | null) {
  const segredo = process.env.CRON_SECRET?.trim();
  if (!segredo || !cabecalho) return false;
  const esperado = Buffer.from(`Bearer ${segredo}`);
  const recebido = Buffer.from(cabecalho);
  return recebido.length === esperado.length && timingSafeEqual(recebido, esperado);
}

/**
 * Envia a newsletter das matérias agendadas que já entraram no ar.
 * Chame a cada 10–15 min com `Authorization: Bearer <CRON_SECRET>` (a Vercel Cron
 * manda esse cabeçalho sozinha quando CRON_SECRET está definida). Sem a variável,
 * a rota fica desligada.
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json({ error: "CRON_SECRET não configurada." }, { status: 503, headers: SEM_CACHE });
  }
  if (!autorizado(request.headers.get("authorization"))) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401, headers: SEM_CACHE });
  }
  const resultado = await dispararNewsletterPendentes();
  return NextResponse.json(resultado, { headers: SEM_CACHE });
}
