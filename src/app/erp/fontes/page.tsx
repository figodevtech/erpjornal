import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserCheck, Lock, Eye, Plus, Shield } from "lucide-react";

const sigiloBadge = {
  publico: "bg-green-50 text-green-700 border-green-200",
  reservado: "bg-amber-50 text-amber-700 border-amber-200",
  confidencial: "bg-red-50 text-red-700 border-red-200",
};

const sigiloIcon = {
  publico: Eye,
  reservado: Shield,
  confidencial: Lock,
};

export default async function FontesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  const role = session.user.role as string;
  const isPrivileged = role === "admin" || role === "editor";

  // Filtro de sigilo: repórteres não vêem fontes confidenciais
  const fontes = await prisma.source.findMany({
    where: isPrivileged ? {} : { nivel_sigilo: { not: "confidencial" } },
    orderBy: { created_at: "desc" },
    include: {
      criador: { select: { nome: true } },
      _count: { select: { anotacoes: true } }
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">CRM de Fontes</h1>
          <p className="text-sm text-slate-500 mt-1">
            {fontes.length} fonte{fontes.length !== 1 ? "s" : ""} cadastrada{fontes.length !== 1 ? "s" : ""}
            {!isPrivileged && " · fontes confidenciais ocultas"}
          </p>
        </div>
        <Link
          href="/erp/fontes/nova"
          className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-500 transition-all shadow-md text-sm"
        >
          <Plus className="w-4 h-4" />
          Nova Fonte
        </Link>
      </div>

      {fontes.length === 0 ? (
        <div className="py-32 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-400">Nenhuma fonte cadastrada</h3>
          <p className="text-slate-400 max-w-sm mx-auto mt-2 text-sm">
            Cadastre contatos governamentais e jornalísticos com controle de sigilo.
          </p>
          <Link href="/erp/fontes/nova" className="inline-flex items-center gap-2 mt-6 bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-500 transition-all text-sm">
            <Plus className="w-4 h-4" /> Adicionar primeira fonte
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {fontes.map((fonte) => {
            const sigilo = fonte.nivel_sigilo as "publico" | "reservado" | "confidencial";
            const IconSigilo = sigiloIcon[sigilo];
            return (
              <Link
                key={fonte.id}
                href={`/erp/fontes/${fonte.id}`}
                className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all group space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border flex items-center gap-1 ${sigiloBadge[sigilo]}`}>
                    <IconSigilo className="w-3 h-3" /> {sigilo}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{fonte.nome}</h3>
                  {(fonte.cargo || fonte.organizacao) && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {fonte.cargo}{fonte.cargo && fonte.organizacao ? " · " : ""}{fonte.organizacao}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Por {fonte.criador.nome}</span>
                  <span className="font-bold text-slate-500">{fonte._count.anotacoes} anotaç{fonte._count.anotacoes !== 1 ? "ões" : "ão"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
