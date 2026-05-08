import { FileText } from "lucide-react";

import { exigirPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import NovaRevistaDialog from "./components/NovaRevistaDialog";
import RevistaCard from "./components/RevistaCard";

export default async function RevistasPage() {
  const session = await exigirPermissao("revistas:ler");
  const podeCriar = temPermissao(session, "revistas:criar");
  const podeEditar = temPermissao(session, "revistas:editar");

  const revistas = await prisma.revista.findMany({
    orderBy: [{ dataPublicacao: "desc" }, { createdAt: "desc" }],
    include: {
      _count: {
        select: { artigos: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Revistas</h1>
          <p className="mt-1 text-sm text-gray-500">{revistas.length} edições cadastradas.</p>
        </div>
        {podeCriar && <NovaRevistaDialog />}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {revistas.map((revista) => (
          <RevistaCard key={revista.id} revista={revista} podeEditar={podeEditar} />
        ))}
      </div>

      {revistas.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">Nenhuma revista criada ainda.</p>
        </div>
      )}
    </div>
  );
}
