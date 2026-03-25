"use client";

import { useTransition, useState } from "react";
import { saveArticle } from "../actions";

interface Category {
  id: string;
  nome: string;
}

interface InitialData {
  id: string;
  titulo: string;
  slug: string;
  resumo: string | null;
  corpo_texto: string;
  categoria_id: string | null;
  status_id: string;
  data_publicacao: Date | null;
}

interface ArticleFormProps {
  categories: Category[];
  userRole: string;
  initialData?: InitialData | null;
}

export default function ArticleForm({ categories, userRole, initialData }: ArticleFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  // Inicia com o status do banco, ou "rascunho"
  const [statusInput, setStatusInput] = useState(initialData?.status_id || "rascunho");

  const formatSlug = (val: string) => {
    return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const formatedDate = initialData?.data_publicacao 
    ? new Date(initialData.data_publicacao.getTime() - initialData.data_publicacao.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    : "";

  const handleAction = async (formData: FormData) => {
    setError("");
    startTransition(async () => {
      try {
        await saveArticle(formData);
      } catch (err: unknown) {
        setError((err as Error).message || "Erro interno ao salvar.");
      }
    });
  };

  const canPublish = userRole === "admin" || userRole === "editor";

  return (
    <form action={handleAction} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
      {/* Campo Oculto para UPDATE Dinâmico Controlado por React API Routes */}
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      {error && (
        <div className="mb-6 p-4 bg-rose-50 text-rose-800 border-l-4 border-rose-500 rounded-r-lg text-sm font-medium">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Título da Matéria <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text" 
              name="titulo" 
              required 
              defaultValue={initialData?.titulo}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
              placeholder="Ex: Nova reforma tem impacto positivo"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              URL (Slug) <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text" 
              name="slug" 
              required 
              defaultValue={initialData?.slug}
              onChange={(e) => e.target.value = formatSlug(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-600 font-mono text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
              placeholder="ex: nova-reforma-impacto"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Resumo (Linha Fina)
            </label>
            <textarea 
              name="resumo" 
              rows={2}
              defaultValue={initialData?.resumo || ""}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none" 
              placeholder="Breve sumário exibido abaixo do título..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Corpo do Texto <span className="text-rose-500">*</span>
            </label>
            <textarea 
              name="corpo_texto" 
              required
              rows={14}
              defaultValue={initialData?.corpo_texto}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-4 text-slate-900 font-serif leading-relaxed focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
              placeholder="Escreva a matéria detalhada aqui..."
            ></textarea>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/60 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">
              Controle de Publicação
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                <select 
                  name="categoria_id" 
                  defaultValue={initialData?.categoria_id || ""}
                  className="w-full bg-white border border-slate-200 rounded-lg shadow-sm p-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                >
                  <option value="">Selecione uma categoria...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Status do Workflow</label>
                <select 
                  name="status_id" 
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg shadow-sm p-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                >
                  <option value="rascunho">Salvar como Rascunho</option>
                  <option value="em_revisao">Enviar para Revisão</option>
                  {canPublish && <option value="publicado">Publicar Oficialmente</option>}
                </select>
              </div>

              {statusInput === "publicado" && canPublish && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Agendamento (Opcional)</label>
                  <input 
                    type="datetime-local" 
                    name="data_publicacao" 
                    defaultValue={formatedDate}
                    className="w-full bg-white border border-slate-200 rounded-lg shadow-sm p-3 text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">Deixe em branco para publicar agora.</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/80">
              <button 
                type="submit" 
                disabled={isPending}
                className="group w-full bg-indigo-600 text-white font-semibold flex justify-center items-center px-6 py-3.5 rounded-xl border border-transparent shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-70 disabled:hover:-translate-y-0 disabled:active:scale-100 disabled:cursor-not-allowed transition-all duration-200 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </span>
                ) : (initialData?.id ? "Atualizar Matéria" : "Salvar Matéria")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
