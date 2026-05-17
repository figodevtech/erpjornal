"use server";

import { exigirAcessoErp } from "@/lib/auth";
import { getAppConfigSnapshot } from "@/lib/app-config";

export async function getErpConfig() {
  await exigirAcessoErp();
  return getAppConfigSnapshot();
}
