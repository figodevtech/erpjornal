import { exigirPermissao, temPermissao } from "@/lib/auth";

import { getPoliticians } from "../politicos/actions";
import PoliticianManager from "../politicos/components/PoliticianManager";

export default async function EntidadesPage() {
  const session = await exigirPermissao("entidades:ler");
  const podeCriar = temPermissao(session, "entidades:criar");
  const podeEditar = temPermissao(session, "entidades:editar");

  const politicians = await getPoliticians();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PoliticianManager initialPoliticians={politicians} podeCriar={podeCriar} podeEditar={podeEditar} />
    </div>
  );
}
