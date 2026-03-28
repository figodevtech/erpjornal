"use client";

import { useTransition } from "react";
import { savePodcast } from "../actions";
import Link from "next/link";
import { ArrowLeft, Share2 } from "lucide-react";

interface PodcastData {
  id?: string;
  titulo?: string;
  slug?: string;
  descricao?: string | null;
  audio_url?: string;
  capa_url?: string | null;
  duracao?: number | null;
  tags?: string[];
  status?: string;
}

interface PodcastFormProps {
  initialData?: PodcastData;
}

export default function PodcastForm({ initialData }: PodcastFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => savePodcast(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
       {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 label-required">Título do Episódio</label>
            <input type="text" name="titulo" required defaultValue={initialData?.titulo ?? ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 label-required">Slug</label>
            <input type="text" name="slug" required defaultValue={initialData?.slug ?? ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 label-required">URL do Áudio (CDN/S3)</label>
             <input type="url" name="audio_url" required defaultValue={initialData?.audio_url ?? ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">URL da Capa (Opcional)</label>
             <input type="url" name="capa_url" defaultValue={initialData?.capa_url ?? ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 label-required">Duração (segundos)</label>
             <input type="number" name="duracao" required defaultValue={initialData?.duracao ?? ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Tags (separadas por vírgula)</label>
             <input type="text" name="tags" defaultValue={initialData?.tags?.join(", ") ?? ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Status</label>
             <select name="status" defaultValue={initialData?.status || "draft"} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all">
                <option value="draft">Rascunho</option>
                <option value="published">Publicado</option>
             </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Descrição/Transcrição Breve</label>
            <textarea name="descricao" rows={5} defaultValue={initialData?.descricao ?? ""} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none" />
          </div>
       </div>

       <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
          <button type="submit" disabled={isPending} className="bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-500 transition-all disabled:opacity-50 text-sm shadow-md">
             {isPending ? "Salvando..." : (initialData?.id ? "Atualizar Episódio" : "Cadastrar Episódio")}
          </button>
          <Link href="/erp/podcasts" className="text-sm font-medium text-gray-500 hover:text-gray-900">Cancelar</Link>
       </div>
    </form>
  );
}

