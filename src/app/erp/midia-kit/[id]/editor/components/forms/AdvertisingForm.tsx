import { MediaKitAdvertisingData, MediaKitAdvertisingItem } from "@/types/media-kit";
import { Plus, Trash2, Star } from "lucide-react";
import ImageUploadField from "./ImageUploadField";

interface Props {
  mediaKitId: string;
  data: Partial<MediaKitAdvertisingData>;
  onChange: (data: Partial<MediaKitAdvertisingData>) => void;
}

export default function AdvertisingForm({ mediaKitId, data, onChange }: Props) {
  const items = data.items || [];

  function addItem() {
    onChange({ 
      items: [
        ...items, 
        { 
          id: Math.random().toString(36).substr(2, 9),
          modalidade: "Novo Formato", 
          descricao: "", 
          preco: "R$ 0,00", 
          destaque: false 
        }
      ] 
    });
  }

  function updateItem(index: number, updates: Partial<MediaKitAdvertisingItem>) {
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
          placeholder="Ex: Formatos Publicitários"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Subtítulo</label>
        <input
          type="text"
          value={data.subtitle || ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          placeholder="Ex: Escolha o melhor formato para sua marca"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-900">Formatos / Tabela de Preços</label>
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700"
          >
            <Plus className="h-3 w-3" /> Adicionar Formato
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-xs text-gray-500 text-center py-4 border border-dashed rounded-xl">Nenhum formato adicionado.</p>
        )}

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id || index} className={`relative rounded-xl border p-4 transition-all ${item.destaque ? 'border-rose-200 bg-rose-50/30' : 'border-gray-100 bg-gray-50'}`}>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={item.modalidade}
                        onChange={(e) => updateItem(index, { modalidade: e.target.value })}
                        className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-bold text-gray-900 focus:border-rose-400 focus:outline-none"
                        placeholder="Nome do Formato (ex: Super Banner)"
                      />
                      <button
                        type="button"
                        onClick={() => updateItem(index, { destaque: !item.destaque })}
                        className={`p-1.5 rounded-lg border transition-colors ${item.destaque ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-white border-gray-200 text-gray-500 hover:text-rose-400'}`}
                        title="Marcar como destaque"
                      >
                        <Star className={`h-4 w-4 ${item.destaque ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <textarea
                      value={item.descricao}
                      onChange={(e) => updateItem(index, { descricao: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-900 focus:border-rose-400 focus:outline-none"
                      placeholder="Descrição técnica ou benefícios..."
                      rows={2}
                    />

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase ml-1">Preço</label>
                        <input
                          type="text"
                          value={item.preco}
                          onChange={(e) => updateItem(index, { preco: e.target.value })}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-mono text-gray-900 focus:border-rose-400 focus:outline-none"
                          placeholder="Ex: R$ 1.500,00"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="ml-2 text-slate-400 hover:text-red-600 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="pt-2 border-t border-gray-200/50">
                  <label className="text-[10px] font-bold text-slate-600 uppercase ml-1 mb-1 block">Imagem do Formato (Opcional)</label>
                  <ImageUploadField
                    mediaKitId={mediaKitId}
                    value={item.imageUrl || ""}
                    onChange={(url) => updateItem(index, { imageUrl: url })}
                    label=""
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
