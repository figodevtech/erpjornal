import { MediaKitContactData } from "@/types/media-kit";

interface Props {
  mediaKitId: string; // Keep for signature consistency if needed later
  data: Partial<MediaKitContactData>;
  onChange: (data: Partial<MediaKitContactData>) => void;
}

export default function ContactForm({ mediaKitId, data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Título da Seção</label>
        <input
          type="text"
          value={data.title || ""}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          placeholder="Ex: Entre em Contato"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Email Comercial</label>
        <input
          type="email"
          value={data.email || ""}
          onChange={(e) => onChange({ email: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          placeholder="Ex: comercial@revistagestao.com.br"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Telefone / WhatsApp</label>
        <input
          type="text"
          value={data.phone || ""}
          onChange={(e) => onChange({ phone: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          placeholder="Ex: (83) 99999-9999"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Endereço Físico (Opcional)</label>
        <textarea
          value={data.address || ""}
          onChange={(e) => onChange({ address: e.target.value })}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          rows={3}
          placeholder="Av. Exemplo, 123..."
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-gray-900">Redes Sociais (Opcional)</label>
        <div className="space-y-3">
          <input
            type="url"
            value={data.socialLinks?.instagram || ""}
            onChange={(e) => onChange({ socialLinks: { ...data.socialLinks, instagram: e.target.value } })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            placeholder="URL do Instagram"
          />
          <input
            type="url"
            value={data.socialLinks?.linkedin || ""}
            onChange={(e) => onChange({ socialLinks: { ...data.socialLinks, linkedin: e.target.value } })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            placeholder="URL do LinkedIn"
          />
          <input
            type="url"
            value={data.socialLinks?.youtube || ""}
            onChange={(e) => onChange({ socialLinks: { ...data.socialLinks, youtube: e.target.value } })}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
            placeholder="URL do YouTube"
          />
        </div>
      </div>
    </div>
  );
}
