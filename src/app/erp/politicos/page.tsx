import { exigirPermissao } from "@/lib/auth";

import { getPoliticians } from "./actions";
import PoliticianManager from "./components/PoliticianManager";

export default async function PoliticosPage() {
  await exigirPermissao("politicos:gerir");

  const politicians = await getPoliticians();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PoliticianManager initialPoliticians={politicians as any} />
    </div>
  );
}
