"use client";

import { useTransition } from "react";
import { saveMedia } from "../actions";
import Link from "next/link";

interface MediaFormProps {
  initialData?: {
    id: string;
    url: string;
    nome: string;
    tipo: string;
    mimetype?: string | null;
    tamanho?: number | null;
    direitos_autorais?: string | null;
    tipo_licenca?: string | null;
    fonte?: string | null;
    data_expiracao?: Date | null;
  };
}

export default function MediaForm({ initialData }: MediaFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(() => saveMedia(formData));
  }

  const formatedExpiration = initialData?.data_expiracao
    ? new Date(initialData.data_expiracao).toISOString().slice(0, 10)
    : "";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
      {initialData?.id && (
        <input type="hidden" name="id" value={initialData.id} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* URL */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            URL do arquivo <span className="text-rose-500">*</span>
          </label>
          <input
            type="url"
            name="url"
            required
            defaultValue={initialData?.url}
            placeholder="https://cdn.exemplo.com/foto.jpg"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
          />
        </div>

        {/* Nome */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Nome do ativo <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="nome"
            required
            defaultValue={initialData?.nome}
            placeholder="Ex: Foto do Plenário 2024"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Tipo <span className="text-rose-500">*</span>
          </label>
          <select
            name="tipo"
            required
            defaultValue={initialData?.tipo || "image"}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
          >
            <option value="image">Imagem</option>
            <option value="video">Vídeo</option>
            <option value="document">Documento</option>
            <option value="audio">Áudio</option>
          </select>
        </div>

        {/* Separador: Metadados de Licença */}
        <div className="md:col-span-2 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center text-[10px]">©</span>
            Direitos e Licença
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Tipo de Licença
              </label>
              <select
                name="tipo_licenca"
                defaultValue={initialData?.tipo_licenca || ""}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              >
                <option value="">Não definido</option>
                <option value="Livre">Livre (Domínio Público)</option>
                <option value="CC BY">CC BY (Atribuição)</option>
                <option value="CC BY-SA">CC BY-SA (Compartilha Igual)</option>
                <option value="CC BY-NC">CC BY-NC (Não Comercial)</option>
                <option value="Pago">Pago / Comercial</option>
                <option value="Editorial">Editorial (não comercial)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Data de Expiração da Licença
              </label>
              <input
                type="date"
                name="data_expiracao"
                defaultValue={formatedExpiration}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Direitos Autorais
              </label>
              <input
                type="text"
                name="direitos_autorais"
                defaultValue={initialData?.direitos_autorais || ""}
                placeholder="Ex: © João Silva 2024"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Fonte / Origem
              </label>
              <input
                type="text"
                name="fonte"
                defaultValue={initialData?.fonte || ""}
                placeholder="Ex: Agência Brasil, Reuters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <button
          type="submit"
          disabled={isPending}
          className="bg-rose-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-rose-500 transition-all disabled:opacity-60 text-sm shadow-md"
        >
          {isPending ? "Salvando..." : initialData?.id ? "Atualizar Ativo" : "Cadastrar Ativo"}
        </button>
        <Link
          href="/erp/midia"
          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
