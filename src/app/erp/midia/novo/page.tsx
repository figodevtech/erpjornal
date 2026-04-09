import Link from "next/link";

import { exigirPermissao } from "@/lib/auth";

import MediaForm from "../components/MediaForm";

export default async function NovoMidiaPage() {
  await exigirPermissao("midia:criar");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link
          href="/erp/midia"
          className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition-all hover:bg-gray-100 hover:text-gray-900"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Novo Ativo de Midia</h1>
          <p className="mt-1 text-sm text-gray-500">Cadastre uma imagem, video ou documento com seus metadados.</p>
        </div>
      </div>
      <MediaForm />
    </div>
  );
}
