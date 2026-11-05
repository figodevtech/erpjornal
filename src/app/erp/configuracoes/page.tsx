import { exigirPermissao } from "@/lib/auth";

import ConfiguracoesPanel from "./ConfiguracoesPanel";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  await exigirPermissao("configuracoes:gerir");
  return <ConfiguracoesPanel />;
}
