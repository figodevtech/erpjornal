import { randomBytes } from "node:crypto";

import { NextResponse, after } from "next/server";
import { z } from "zod";

import { Prisma } from "@/generated/prisma/client";
import { enviarEmailDeConfirmacao } from "@/lib/newsletter/email";
import { STATUS_INSCRICAO, acaoAoInscrever } from "@/lib/newsletter/regras";
import { prisma } from "@/lib/prisma";
import { getIP, newsletterRateLimit } from "@/lib/ratelimit";

const Inscricao = z.object({
  email: z.email().max(254).transform((valor) => valor.trim().toLowerCase()),
  origem: z.string().trim().max(100).optional(),
});

/**
 * Inscrição com dupla confirmação (LGPD): grava como pendente e manda um link de
 * confirmação; só quem confirma recebe a newsletter. A resposta é sempre a mesma
 * (não revela se o e-mail já estava na lista) e o e-mail sai depois da resposta.
 */
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

    const { email } = dados.data;
    const origem = dados.data.origem || "desconhecida";
    const atual = await prisma.inscricaoNewsletter.findUnique({
      where: { email },
      select: { id: true, status: true, token: true, confirmacaoEnviadaEm: true },
    });
    const acao = acaoAoInscrever(atual);

    if (acao === "criar") {
      try {
        const nova = await prisma.inscricaoNewsletter.create({
          data: {
            email,
            origem,
            status: STATUS_INSCRICAO.pendente,
            token: randomBytes(24).toString("base64url"),
            confirmacaoEnviadaEm: new Date(),
          },
          select: { token: true },
        });
        after(() => enviarEmailDeConfirmacao(email, nova.token));
      } catch (erro) {
        // Duas inscrições simultâneas do mesmo e-mail: a outra já cuidou disso.
        if (!(erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002")) throw erro;
      }
    } else if (acao === "enviar_confirmacao" && atual) {
      await prisma.inscricaoNewsletter.update({
        where: { id: atual.id },
        data: { status: STATUS_INSCRICAO.pendente, confirmacaoEnviadaEm: new Date(), origem },
      });
      after(() => enviarEmailDeConfirmacao(email, atual.token));
    }

    return NextResponse.json({ success: true, confirmacaoNecessaria: true });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
