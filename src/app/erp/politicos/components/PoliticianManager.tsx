"use client";

import { useState, useTransition } from "react";
import { upsertPolitician, deletePolitician } from "../actions";
import { Plus, Pencil, Trash2, X, Save, UserCircle } from "lucide-react";

export interface Politician {
  id?: string;
  nome: string;
  cargo: string | null;
  partido: string | null;
  biografia: string | null;
  regiao: string | null;
  estado: string | null;
}

export default function PoliticianManager({ initialPoliticians }: { initialPoliticians: Politician[] }) {
  const [politicians] = useState<Politician[]>(initialPoliticians);
  const [editing, setEditing] = useState<Politician | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await upsertPolitician(formData);
        setEditing(null);
        window.location.reload(); // Simples para atualizar a lista
      } catch {
        alert("Erro ao salvar político");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este político?")) return;
    startTransition(async () => {
      try {
        await deletePolitician(id);
        window.location.reload();
      } catch {
        alert("Erro ao excluir");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-slate-800">Diretório de Políticos</h1>
        <button 
          onClick={() => setEditing({ nome: "", cargo: "", partido: "", biografia: "", regiao: "Nacional", estado: "" })}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Novo Político
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {politicians.map((p) => (
          <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{p.nome}</h3>
                  <p className="text-xs text-slate-500 font-medium">{p.cargo} • {p.partido}</p>
                  <p className="text-[10px] text-slate-400 bg-slate-50 inline-block px-1.5 py-0.5 rounded mt-1 border border-slate-100">
                    {p.regiao} {p.estado ? `(${p.estado})` : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setEditing(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id!)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl animate-in zoom-in-95 duration-200">
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-slate-800">
                  {editing.id ? "Editar Político" : "Novo Político"}
                </h2>
                <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {editing.id && <input type="hidden" name="id" value={editing.id} />}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nome Completo</label>
                  <input 
                    name="nome" 
                    required 
                    defaultValue={editing.nome}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Cargo</label>
                    <input name="cargo" defaultValue={editing.cargo || ""} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Partido</label>
                    <input name="partido" defaultValue={editing.partido || ""} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Esfera</label>
                    <select name="regiao" defaultValue={editing.regiao || "Nacional"} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                      <option value="Nacional">Nacional</option>
                      <option value="Estadual">Estadual</option>
                      <option value="Municipal">Municipal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Estado (Sigla)</label>
                    <input name="estado" maxLength={2} defaultValue={editing.estado || ""} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Biografia</label>
                  <textarea name="biografia" rows={3} defaultValue={editing.biografia || ""} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"></textarea>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
                <button type="submit" disabled={isPending} className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                  <Save className="w-5 h-5" />
                  {isPending ? "Salvando..." : "Salvar Político"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
