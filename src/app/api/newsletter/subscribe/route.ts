import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getIP, newsletterRateLimit } from "@/lib/ratelimit";

const Inscricao = z.object({
  email: z.email().max(254).transform((valor) => valor.trim().toLowerCase()),
  origem: z.string().trim().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const { success } = await newsletterRateLimit.limit(getIP(request));
    if (!success) {
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente em alguns minutos." }, { status: 429 });
    }

    const corpo = await request.json().catch(() => null);
    const dados = Inscricao.safeParse(corpo);
    if (!dados.success) {
      return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400 });
    }

    const { email, origem } = dados.data;

    // Antes usava (prisma as any).newsletterSubscription, model que não existe:
    // toda inscrição falhava com 500 e o `as any` escondia o erro do TypeScript.
    await prisma.inscricaoNewsletter.upsert({
      where: { email },
      update: { origem: origem || "desconhecida" },
      create: { email, origem: origem || "desconhecida" },
    });

    // Não devolve o registro: a resposta é a mesma para e-mail novo ou já inscrito.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
