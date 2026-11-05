"use server";

import { revalidatePath } from "next/cache";

import { exigirAcessoErp, exigirPermissao } from "@/lib/auth";
import { getAppConfigSnapshot } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";

export async function getErpConfig() {
  await exigirAcessoErp();
  return getAppConfigSnapshot();
}

// Leitura: qualquer usuário do ERP (cotas e modelos de IA aparecem nas telas).
// Escrita: só quem tem configuracoes:gerir (antes bastava ter acesso ao ERP).
export async function updateMarketTickerEnabled(enabled: boolean) {
  await exigirPermissao("configuracoes:gerir");
  if (typeof enabled !== "boolean") {
    throw new Error("Valor inválido.");
  }

  await prisma.appConfig.upsert({
    where: { id: "global" },
    update: { marketTickerEnabled: enabled },
    create: {
      id: "global",
      usageMonth: new Date().toISOString().slice(0, 7),
      marketTickerEnabled: enabled,
    },
  });

  revalidatePath("/");
  revalidatePath("/erp");
  revalidatePath("/erp/configuracoes");

  return getAppConfigSnapshot();
}
