import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import PaginaInstitucional from "@/components/portal/PaginaInstitucional";
import { obterSessao, podeAcessarErp } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Meu perfil | Revista Gestão",
  robots: { index: false },
};

const ROTULO_TIPO_CONTA: Record<string, string> = {
  erp: "Equipe (ERP)",
  portal: "Leitor",
  misto: "Equipe e leitor",
};

export default async function PerfilPage() {
  const sessao = await obterSessao();
  if (!sessao) {
    redirect("/login?callbackUrl=/perfil");
  }

  const { name, email, tipoConta, perfis } = sessao.user;

  return (
    <PaginaInstitucional eyebrow="Minha conta" titulo={name || "Meu perfil"}>
      <dl className="not-prose grid gap-4 rounded-2xl border border-gray-200 p-6 dark:border-gray-800 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold uppercase tracking-widest text-gray-500">E-mail</dt>
          <dd className="mt-1 text-gray-900 dark:text-gray-100">{email || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-widest text-gray-500">Tipo de conta</dt>
          <dd className="mt-1 text-gray-900 dark:text-gray-100">{ROTULO_TIPO_CONTA[tipoConta] ?? tipoConta}</dd>
        </div>
        {perfis.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-bold uppercase tracking-widest text-gray-500">Perfis</dt>
            <dd className="mt-1 text-gray-900 dark:text-gray-100">{perfis.join(", ")}</dd>
          </div>
        )}
      </dl>

      <div className="not-prose mt-8 flex flex-wrap gap-3">
        <Link
          href="/redefinir-senha"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
        >
          Alterar senha
        </Link>
        {podeAcessarErp(sessao) && (
          <Link
            href="/erp"
            className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-800"
          >
            Abrir o ERP
          </Link>
        )}
      </div>
    </PaginaInstitucional>
  );
}
