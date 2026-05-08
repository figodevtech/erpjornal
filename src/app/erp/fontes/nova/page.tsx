import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { exigirPermissao } from "@/lib/auth";

import FonteForm from "../components/FonteForm";

export default async function NovaFontePage() {
  await exigirPermissao("fontes:criar");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link
          href="/erp/fontes"
          className="rounded-full border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition-all hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Nova Fonte</h1>
          <p className="mt-1 text-sm text-gray-500">Cadastre um contato jornalístico ou governamental.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <FonteForm />
      </div>
    </div>
  );
}
