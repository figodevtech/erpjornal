import { MediaKitAboutData } from "@/types/media-kit";
import ImageUploadField from "./ImageUploadField";

interface Props {
  mediaKitId: string;
  data: Partial<MediaKitAboutData>;
  onChange: (data: Partial<MediaKitAboutData>) => void;
}

export default function AboutForm({ mediaKitId, data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Título</label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Conteúdo / Texto Descritivo</label>
        <textarea
          value={data.content || ""}
          onChange={(e) => onChange({ content: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          rows={5}
        />
      </div>

      <ImageUploadField
        mediaKitId={mediaKitId}
        label="Imagem Ilustrativa (Opcional)"
        value={data.imageUrl}
        onChange={(url) => onChange({ imageUrl: url })}
      />
    </div>
  );
}
