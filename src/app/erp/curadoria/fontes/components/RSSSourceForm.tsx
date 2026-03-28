"use client";

import { useState } from "react";
import { Plus, X, Globe, Save, Trash2 } from "lucide-react";
import { saveRSSSource, deleteRSSSource } from "../../actions";
import { toast } from "sonner";

interface RSSSourceFormProps {
  source?: any;
}

export function RSSSourceForm({ source }: RSSSourceFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">
            <div className="bg-gray-900 p-8 text-white relative">
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">{source ? "Editar Feed" : "Novo Feed RSS"}</h2>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Configuração de Coleta</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <input type="hidden" name="id" value={source?.id || ""} />
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome do Veículo</label>
                    <input name="name" defaultValue={source?.name} required placeholder="Ex: CNN Brasil" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">URL do Feed RSS</label>
                    <input name="feed_url" defaultValue={source?.feed_url} required placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tom de Voz</label>
                    <select name="tone" defaultValue={source?.tone || "jornalistico"} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="jornalistico">Jornalístico</option>
                      <option value="direto">Direto / Hard News</option>
                      <option value="opinativo">Opinativo</option>
                      <option value="informal">Informal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Intervalo (Minutos)</label>
                    <input name="cache_ttl" type="number" defaultValue={source?.cache_ttl || 30} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Região</label>
                    <select name="regiao" defaultValue={source?.regiao || "Nacional"} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none">
                      <option value="Nacional">Nacional</option>
                      <option value="Estadual">Estadual</option>
                      <option value="Municipal">Municipal</option>
                      <option value="Internacional">Internacional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Estado (Sigla)</label>
                    <input name="estado" maxLength={2} defaultValue={source?.estado} placeholder="SP" className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold uppercase focus:ring-2 focus:ring-indigo-500 outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                {source && (
                  <button
                    type="button"
                    onClick={async () => {
                      if(confirm("Deseja realmente excluir este feed?")) {
                        await deleteRSSSource(source.id);
                        toast.success("Feed excluído");
                        setIsOpen(false);
                      }
                    }}
                    className="p-4 rounded-2xl border border-gray-200 text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white font-black uppercase tracking-widest p-4 rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {loading ? "Salvando..." : "Salvar Configuração"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

