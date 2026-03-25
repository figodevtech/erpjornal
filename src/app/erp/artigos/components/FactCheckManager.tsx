"use client";

import { useState } from "react";
import { Plus, Trash2, ShieldCheck } from "lucide-react";

export interface FactCheckItem {
  id?: string;
  fonte_url: string;
  documento_url: string;
  status_verificacao: string;
}

export function FactCheckManager({ initialData = [] }: { initialData?: FactCheckItem[] }) {
  const [items, setItems] = useState<FactCheckItem[]>(initialData);

  const addItem = () => {
    setItems([...items, { fonte_url: "", documento_url: "", status_verificacao: "verificado" }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof FactCheckItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          Módulo de Fact-Checking & Evidências
        </h3>
        <button 
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 text-xs font-bold bg-white text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Adicionar Evidência
        </button>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
            <p className="text-sm text-slate-400 italic">Nenhuma fonte ou documento anexado ainda.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 animate-in fade-in slide-in-from-top-1">
              <input type="hidden" name={`fact_check_id_${index}`} value={item.id || ""} />
              
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">URL da Fonte</label>
                    <div className="relative">
                      <input 
                        type="url" 
                        name={`fact_check_url_${index}`}
                        value={item.fonte_url}
                        onChange={(e) => updateItem(index, "fonte_url", e.target.value)}
                        placeholder="https://exemplo.com/fonte"
                        className="w-full text-sm p-2 bg-slate-50 border border-slate-100 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doc/Ref Adicional</label>
                    <input 
                      type="text" 
                      name={`fact_check_doc_${index}`}
                      value={item.documento_url}
                      onChange={(e) => updateItem(index, "documento_url", e.target.value)}
                      placeholder="Nome do documento ou link secundário"
                      className="w-full text-sm p-2 bg-slate-50 border border-slate-100 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-3 min-w-[150px]">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Veracidade</label>
                  <select 
                    name={`fact_check_status_${index}`}
                    value={item.status_verificacao}
                    onChange={(e) => updateItem(index, "status_verificacao", e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-200 rounded font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    <option value="verificado">Verificado</option>
                    <option value="suspeito">Suspeito</option>
                    <option value="falso">Falso</option>
                  </select>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => removeItem(index)}
                  className="p-2.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Campo auxiliar para saber quantos items temos */}
      <input type="hidden" name="fact_checks_count" value={items.length} />
    </div>
  );
}
