"use client";

import { useState, useTransition } from "react";
import { saveMedia, suggestMediaTags } from "../actions";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

interface MediaFormProps {
  initialData?: {
    id: string;
    url: string;
    nome: string;
    tipo: string;
    mimeType?: string | null;
    tamanho?: number | null;
    direitosAutorais?: string | null;
    tipoLicenca?: string | null;
    fonte?: string | null;
    dataExpiracao?: Date | null;
    tagsIa?: unknown;
  };
}

export default function MediaForm({ initialData }: MediaFormProps) {
  const [isPending, startTransition] = useTransition();
  const [tags, setTags] = useState<string[]>(initialData?.tagsIa as string[] || []);
  const [isSuggesting, setIsSuggesting] = useState(false);

  async function handleSuggestTags() {
    const nome = (document.getElementsByName("nome")[0] as HTMLInputElement).value;
    const tipo = (document.getElementsByName("tipo")[0] as HTMLSelectElement).value;
    
    if (!nome) return alert("Digite um nome para sugerir tags");
    
    setIsSuggesting(true);
    try {
      const suggestions = await suggestMediaTags(nome, tipo);
      setTags(prev => Array.from(new Set([...prev, ...suggestions])));
    } finally {
      setIsSuggesting(false);
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Adiciona as tags ao formData
    formData.append("tagsIa", JSON.stringify(tags));
    
    startTransition(() => saveMedia(formData));
  }

  const formatedExpiration = initialData?.dataExpiracao
    ? new Date(initialData.dataExpiracao).toISOString().slice(0, 10)
    : "";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
      {initialData?.id && (
        <input type="hidden" name="id" value={initialData.id} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* URL */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            URL do arquivo <span className="text-rose-500">*</span>
          </label>
          <input
            type="url"
            name="url"
            required
            defaultValue={initialData?.url}
            placeholder="https://cdn.exemplo.com/foto.jpg"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
          />
        </div>

        {/* Nome */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            Nome do ativo <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="nome"
            required
            defaultValue={initialData?.nome}
            placeholder="Ex: Foto do Plenário 2024"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            Tipo <span className="text-rose-500">*</span>
          </label>
          <select
            name="tipo"
            required
            defaultValue={initialData?.tipo || "image"}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
          >
            <option value="image">Imagem</option>
            <option value="video">Vídeo</option>
            <option value="document">Documento</option>
            <option value="audio">Áudio</option>
          </select>
        </div>

        {/* Separador: Metadados de Licença */}
        <div className="md:col-span-2 pt-2 border-t border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-600 inline-flex items-center justify-center text-[10px]">©</span>
            Direitos e Licença
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Tipo de Licença
              </label>
              <select
                name="tipoLicenca"
                defaultValue={initialData?.tipoLicenca || ""}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
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
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Data de Expiração da Licença
              </label>
              <input
                type="date"
                name="dataExpiracao"
                defaultValue={formatedExpiration}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Direitos Autorais
              </label>
              <input
                type="text"
                name="direitosAutorais"
                defaultValue={initialData?.direitosAutorais || ""}
                placeholder="Ex: © João Silva 2024"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Fonte / Origem
              </label>
              <input
                type="text"
                name="fonte"
                defaultValue={initialData?.fonte || ""}
                placeholder="Ex: Agência Brasil, Reuters"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>
        {/* IA Tags (M2-PLUS-T4-ST2) */}
        <div className="md:col-span-2 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tags Sugeridas por IA
            </h3>
            <button
              type="button"
              onClick={handleSuggestTags}
              disabled={isSuggesting}
              className="text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-100 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3" />
              {isSuggesting ? "Sugerindo..." : "Gerar Sugestões"}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
            {tags.length === 0 && (
              <p className="text-[11px] text-gray-400 italic">Nenhuma tag sugerida ainda. Clique em gerar para começar.</p>
            )}
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-[11px] font-medium px-2.5 py-1 rounded-full shadow-sm">
                {tag}
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  className="hover:text-rose-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={isPending}
          className="bg-rose-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-rose-500 transition-all disabled:opacity-60 text-sm shadow-md"
        >
          {isPending ? "Salvando..." : initialData?.id ? "Atualizar Ativo" : "Cadastrar Ativo"}
        </button>
        <Link
          href="/erp/midia"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

