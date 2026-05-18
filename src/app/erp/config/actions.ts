"use server";

import { revalidatePath } from "next/cache";

import { exigirAcessoErp } from "@/lib/auth";
import { getAppConfigSnapshot } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";

export async function getErpConfig() {
  await exigirAcessoErp();
  return getAppConfigSnapshot();
}

export async function updateMarketTickerEnabled(enabled: boolean) {
  await exigirAcessoErp();

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
