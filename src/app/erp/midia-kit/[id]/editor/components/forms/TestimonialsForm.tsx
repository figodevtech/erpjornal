import { MediaKitTestimonialsData } from "@/types/media-kit";
import { Plus, Trash2 } from "lucide-react";
import ImageUploadField from "./ImageUploadField";

interface Props {
  mediaKitId: string;
  data: Partial<MediaKitTestimonialsData>;
  onChange: (data: Partial<MediaKitTestimonialsData>) => void;
}

export default function TestimonialsForm({ mediaKitId, data, onChange }: Props) {
  const items = data.items || [];

  function addItem() {
    onChange({ items: [...items, { quote: "Ótima parceria!", author: "Nome do Cliente", role: "Cargo" }] });
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
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Título da Seção</label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          placeholder="Ex: O que dizem nossos parceiros"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-900">Depoimentos</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-xs text-slate-600 text-center py-4 border border-dashed rounded-xl">Nenhum depoimento adicionado.</p>
        )}

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex justify-between items-start">
                <textarea
                  value={item.quote}
                  onChange={(e) => updateItem(index, { quote: e.target.value })}
                  className="w-full text-sm text-gray-900 font-medium italic bg-white border border-gray-100 rounded-lg p-2 focus:border-rose-400 focus:outline-none placeholder-gray-400 resize-none"
                  placeholder="&quot;O retorno da campanha foi excelente...&quot;"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-gray-400 hover:text-red-600 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                <div className="space-y-2">
                  <input
                    type="text"
                    value={item.author}
                    onChange={(e) => updateItem(index, { author: e.target.value })}
                    className="w-full text-sm font-bold text-gray-900 bg-transparent focus:outline-none placeholder-gray-500"
                    placeholder="Nome do Cliente"
                  />
                  <input
                    type="text"
                    value={item.role || ""}
                    onChange={(e) => updateItem(index, { role: e.target.value })}
                    className="w-full text-xs text-gray-700 font-semibold bg-transparent focus:outline-none placeholder-gray-500"
                    placeholder="Cargo e Empresa"
                  />
                </div>
                <div>
                  <ImageUploadField
                    mediaKitId={mediaKitId}
                    label="Avatar/Logo da Empresa"
                    value={item.avatarUrl}
                    onChange={(url) => updateItem(index, { avatarUrl: url })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
