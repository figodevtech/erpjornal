"use client";

import { useState } from "react";
import { Plus, X, Globe, Save, Trash2, RefreshCcw } from "lucide-react";
import { saveRSSSource, deleteRSSSource } from "../../actions";
import { toast } from "sonner";

import { createPortal } from "react-dom";

interface RSSSourceFormProps {
  source?: any;
}

export function RSSSourceForm({ source }: RSSSourceFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Garantir que o portal só renderize no cliente
  useState(() => {
    if (typeof window !== "undefined") {
      setMounted(true);
    }
    return undefined;
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await saveRSSSource(formData);
      toast.success("Fonte salva com sucesso!");
      setIsOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const modalContent = isOpen && (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
        {/* Header - Solid Background */}
        <div className="bg-slate-900 p-8 text-white relative flex-shrink-0">
          <button 
            type="button"
            onClick={() => setIsOpen(false)} 
            className="absolute top-6 right-6 text-white/40 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">{source ? "Editar Fonte" : "Novo Feed"}</h2>
              <p className="text-indigo-400 text-[9px] font-black uppercase tracking-widest">Configuração de Canal</p>
            </div>
          </div>
        </div>

        {/* Content - Solid White Background */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white overflow-y-auto max-h-[80vh]">
          <input type="hidden" name="id" value={source?.id || ""} />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Nome da Fonte</label>
              <input 
                name="name" 
                defaultValue={source?.name} 
                required 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all" 
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">URL do Feed (XML)</label>
              <input 
                name="feed_url" 
                defaultValue={source?.feed_url} 
                required 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-mono text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Tom de Voz</label>
                <select 
                  name="tone" 
                  defaultValue={source?.tone || "jornalistico"} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all cursor-pointer"
                >
                  <option value="jornalistico">Jornalístico</option>
                  <option value="direto">Hard News</option>
                  <option value="informal">Informal</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Refresh (Min)</label>
                <input 
                  name="cache_ttl" 
                  type="number" 
                  defaultValue={source?.cache_ttl || 30} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-bold text-slate-900 focus:bg-white focus:border-indigo-500 outline-none transition-all" 
                />
              </div>
            </div>

            <div className="pt-4 pb-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    name="is_active" 
                    defaultChecked={source?.is_active ?? true}
                    className="sr-only peer" 
                    value="true"
                  />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-emerald-500 transition-all" />
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-all" />
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Fonte Ativa</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            {source && (
              <button
                type="button"
                onClick={async () => {
                  if(confirm("Deletar esta fonte?")) {
                    await deleteRSSSource(source.id);
                    toast.success("Deletada");
                    setIsOpen(false);
                  }
                }}
                className="p-3 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white font-black uppercase tracking-widest p-4 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : source ? "Atualizar" : "Criar Fonte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={source ? "p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-all" : "flex items-center gap-2 bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-500 transition-all shadow-md text-sm uppercase tracking-widest"}
      >
        {source ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ) : <><Plus className="w-4 h-4" /> Novo Feed RSS</>}
      </button>

      {mounted && typeof document !== "undefined" && createPortal(modalContent, document.body)}
    </>
  );
}
