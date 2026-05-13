import { MediaKitHeroData } from "@/types/media-kit";
import ImageUploadField from "./ImageUploadField";

interface Props {
  mediaKitId: string;
  data: Partial<MediaKitHeroData>;
  onChange: (data: Partial<MediaKitHeroData>) => void;
}

export default function HeroForm({ mediaKitId, data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Título Principal</label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          placeholder="Ex: Anuncie na maior revista de negócios"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Subtítulo</label>
        <textarea
          value={data.subtitle || ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          rows={3}
          placeholder="Apresente brevemente o propósito do mídia kit..."
        />
      </div>

      <ImageUploadField
        mediaKitId={mediaKitId}
        label="Imagem de Fundo (Banner)"
        value={data.backgroundImage}
        onChange={(url) => onChange({ backgroundImage: url })}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-900">Texto do Botão (CTA)</label>
          <input
            type="text"
            value={data.ctaText || ""}
            onChange={(e) => onChange({ ctaText: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            placeholder="Ex: Fale Conosco"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-900">Link do Botão (CTA)</label>
          <input
            type="text"
            value={data.ctaLink || ""}
            onChange={(e) => onChange({ ctaLink: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            placeholder="Ex: #contato ou https://..."
          />
        </div>
      </div>
    </div>
  );
}
