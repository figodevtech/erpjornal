import Link from "next/link";
import { Eye, Lock, Plus, Shield, UserCheck } from "lucide-react";

import { exigirAlgumaPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
  const session = await exigirAlgumaPermissao(["fontes:ler", "fontes:criar", "fontes:editar"]);

  const role = session.user.role as string;
  const isPrivileged = role === "admin" || role === "editor";
  const podeCriar = temPermissao(session, "fontes:criar");

  const fontes = await prisma.fonte.findMany({
    where: isPrivileged ? {} : { nivelSigilo: { not: "confidencial" } },
    orderBy: { criadoEm: "desc" },
    include: {
      criador: { select: { nome: true } },
      _count: { select: { anotacoes: true } },
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">CRM de Fontes</h1>
          <p className="mt-1 text-sm text-gray-500">
            {fontes.length} fonte{fontes.length !== 1 ? "s" : ""} cadastrada
            {fontes.length !== 1 ? "s" : ""}
            {!isPrivileged && " · fontes confidenciais ocultas"}
          </p>
        </div>
        {podeCriar && (
          <Link
            href="/erp/fontes/nova"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Nova Fonte
          </Link>
        )}
      </div>

      {fontes.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50/50 py-32 text-center">
          <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <h3 className="text-xl font-bold text-gray-400">Nenhuma fonte cadastrada</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-400">
            Cadastre contatos governamentais e jornalisticos com controle de sigilo.
          </p>
          {podeCriar && (
            <Link
              href="/erp/fontes/nova"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" /> Adicionar primeira fonte
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {fontes.map((fonte) => {
            const sigilo = fonte.nivelSigilo as "publico" | "reservado" | "confidencial";
            const IconSigilo = sigiloIcon[sigilo];

            return (
              <Link
                key={fonte.id}
                href={`/erp/fontes/${fonte.id}`}
                className="group space-y-4 rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                    <UserCheck className="h-5 w-5 text-indigo-600" />
                  </div>
                  <span
                    className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${sigiloBadge[sigilo]}`}
                  >
                    <IconSigilo className="h-3 w-3" /> {sigilo}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 transition-colors group-hover:text-indigo-600">
                    {fonte.nome}
                  </h3>
                  {(fonte.cargo || fonte.organizacao) && (
                    <p className="mt-0.5 text-xs text-gray-500">
                      {fonte.cargo}
                      {fonte.cargo && fonte.organizacao ? " · " : ""}
                      {fonte.organizacao}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-[11px] text-gray-400">
                  <span>Por {fonte.criador.nome}</span>
                  <span className="font-bold text-gray-500">
                    {fonte._count.anotacoes} anotac{fonte._count.anotacoes !== 1 ? "oes" : "ao"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
