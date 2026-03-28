import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { saveSource } from "../actions";
import { ArrowLeft } from "lucide-react";

export default async function NovaFontePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/api/auth/signin");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/erp/fontes" className="text-gray-400 hover:text-gray-900 bg-white hover:bg-gray-100 p-2 rounded-full shadow-sm transition-all border border-gray-200">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Nova Fonte</h1>
          <p className="text-sm text-gray-500 mt-1">Cadastre um contato jornalístico ou governamental.</p>
        </div>
      </div>

      <form action={saveSource} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Nome <span className="text-rose-500">*</span>
            </label>
            <input type="text" name="nome" required placeholder="Ex: João Silva"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Cargo</label>
            <input type="text" name="cargo" placeholder="Ex: Secretário de Estado"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Organização</label>
            <input type="text" name="organizacao" placeholder="Ex: Prefeitura de SP"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
            <input type="email" name="email" placeholder="contato@exemplo.gov.br"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Telefone</label>
            <input type="tel" name="telefone" placeholder="(11) 9 9999-9999"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Nível de Sigilo</label>
            <select name="nivel_sigilo" defaultValue="publico"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
              <option value="publico">🟢 Público — Visível a todos os repórteres</option>
              <option value="reservado">🟡 Reservado — Apenas editores e admin</option>
              <option value="confidencial">🔴 Confidencial — Apenas admin</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Notas Gerais</label>
            <textarea name="notas" rows={3} placeholder="Informações adicionais sobre a fonte..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button type="submit" className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-500 transition-all text-sm shadow-md">
            Cadastrar Fonte
          </button>
          <Link href="/erp/fontes" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

