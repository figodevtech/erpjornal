import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { exigirPermissao } from "@/lib/auth";

import { saveSource } from "../actions";

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
          <p className="mt-1 text-sm text-gray-500">Cadastre um contato jornalistico ou governamental.</p>
        </div>
      </div>

      <form action={saveSource} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">
              Nome <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="nome"
              required
              placeholder="Ex: Joao Silva"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Cargo</label>
            <input
              type="text"
              name="cargo"
              placeholder="Ex: Secretario de Estado"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">
              Organizacao
            </label>
            <input
              type="text"
              name="organizacao"
              placeholder="Ex: Prefeitura de SP"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
            <input
              type="email"
              name="email"
              placeholder="contato@exemplo.gov.br"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Telefone</label>
            <input
              type="tel"
              name="telefone"
              placeholder="(11) 9 9999-9999"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">
              Nivel de Sigilo
            </label>
            <select
              name="nivelSigilo"
              defaultValue="publico"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="publico">Publico - Visivel a todos os reporteres</option>
              <option value="reservado">Reservado - Apenas editores e admin</option>
              <option value="confidencial">Confidencial - Apenas admin</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">
              Notas Gerais
            </label>
            <textarea
              name="notas"
              rows={3}
              placeholder="Informacoes adicionais sobre a fonte..."
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm transition-all outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-gray-100 pt-4">
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-500"
          >
            Cadastrar Fonte
          </button>
          <Link href="/erp/fontes" className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
