import { MediaKitFeaturesData } from "@/types/media-kit";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  mediaKitId: string;
  data: Partial<MediaKitFeaturesData>;
  onChange: (data: Partial<MediaKitFeaturesData>) => void;
}

export default function FeaturesForm({ data, onChange }: Props) {
  const items = data.items || [];

  function addItem() {
    onChange({ items: [...items, { title: "Nova Funcionalidade", description: "", icon: "star" }] });
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
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Título da Seção</label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          placeholder="Ex: Por que anunciar conosco?"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">Itens / Diferenciais</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4 border border-dashed rounded-xl">Nenhum item adicionado.</p>
        )}

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 relative group">
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => updateItem(index, { title: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-bold"
                  placeholder="Título do diferencial"
                />
                <textarea
                  value={item.description}
                  onChange={(e) => updateItem(index, { description: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs"
                  placeholder="Descrição..."
                  rows={2}
                />
                <input
                  type="text"
                  value={item.icon || ""}
                  onChange={(e) => updateItem(index, { icon: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-mono"
                  placeholder="Nome do ícone (ex: star, users, activity)"
                />
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-gray-400 hover:text-red-600 h-fit p-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
