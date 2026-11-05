import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acesso negado | Revista Gestão",
  robots: { index: false },
};

/** Destino de exigirPermissao/exigirAcessoErp quando falta permissão (src/lib/auth.ts). */
export default function AcessoNegadoPage() {
  return (
    <div className="flex w-full flex-1 items-center justify-center px-4 py-24">
      <div className="max-w-md text-center">
        <p className="text-sm font-black uppercase tracking-[0.24em] text-red-700">Erro 403</p>
        <h1 className="mt-3 text-3xl font-black text-gray-900 dark:text-gray-100">Acesso negado</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Sua conta não tem permissão para acessar esta área. Se precisar de acesso, fale com um administrador.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-800"
          >
            Ir para o portal
          </Link>
          <Link
            href="/erp"
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
          >
            Voltar ao ERP
          </Link>
        </div>
      </div>
    </div>
  );
}
