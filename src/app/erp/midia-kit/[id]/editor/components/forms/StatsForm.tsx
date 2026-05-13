import { MediaKitStatsData } from "@/types/media-kit";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  mediaKitId: string;
  data: Partial<MediaKitStatsData>;
  onChange: (data: Partial<MediaKitStatsData>) => void;
}

export default function StatsForm({ mediaKitId, data, onChange }: Props) {
  const items = data.items || [];

  function addItem() {
    onChange({ items: [...items, { label: "Métrica", value: "0" }] });
  }

  function updateItem(index: number, updates: Partial<typeof items[0]>) {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], ...updates };
    onChange({ items: newItems });
  }

  function removeItem(index: number) {
    onChange({ items: items.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Título da Seção (Opcional)</label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          placeholder="Ex: Nossos Números"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-900">Métricas</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-xs text-slate-600 text-center py-4 border border-dashed rounded-xl">Nenhuma métrica adicionada.</p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Número / Valor</label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => updateItem(index, { value: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-900 focus:border-rose-400 focus:outline-none"
                    placeholder="Ex: 50k+"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-slate-600 hover:text-red-600 mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Rótulo / Descrição</label>
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => updateItem(index, { label: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-rose-400 focus:outline-none"
                  placeholder="Ex: Seguidores"
                />
              </div>
              <input
                type="text"
                value={item.suffix || ""}
                onChange={(e) => updateItem(index, { suffix: e.target.value })}
                className="w-full text-xs text-gray-900 bg-transparent focus:outline-none mt-1 placeholder-slate-600"
                placeholder="Sufixo opcional (ex: mensal)"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
