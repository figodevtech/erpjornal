"use server";

import { revalidatePath } from "next/cache";

import { exigirAcessoErp, exigirPermissao } from "@/lib/auth";
import { getAppConfigSnapshot } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "@/lib/auditoria";

export async function getErpConfig() {
  await exigirAcessoErp();
  return getAppConfigSnapshot();
}

// Leitura: qualquer usuário do ERP (cotas e modelos de IA aparecem nas telas).
// Escrita: só quem tem configuracoes:gerir (antes bastava ter acesso ao ERP).
export async function updateMarketTickerEnabled(enabled: boolean) {
  const sessao = await exigirPermissao("configuracoes:gerir");
  if (typeof enabled !== "boolean") {
    throw new Error("Valor inválido.");
  }
  await prisma.$transaction(async (tx) => {
    const anterior = await tx.appConfig.findUnique({
      where: { id: "global" },
      select: { marketTickerEnabled: true },
    });
    await tx.appConfig.upsert({
      where: { id: "global" },
      update: { marketTickerEnabled: enabled },
      create: {
        id: "global",
        usageMonth: new Date().toISOString().slice(0, 7),
        marketTickerEnabled: enabled,
      },
    });
    await registrarAuditoria(
      {
        usuarioId: sessao.user.id,
        acao: "EDICAO",
        entidade: "configuracao",
        entidadeId: null,
        antes: anterior ?? undefined,
        depois: { marketTickerEnabled: enabled },
      },
      tx
    );
  });

  revalidatePath("/");
  revalidatePath("/erp");
  revalidatePath("/erp/configuracoes");

  return getAppConfigSnapshot();
}
