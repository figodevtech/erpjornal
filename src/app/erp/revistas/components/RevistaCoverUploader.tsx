"use client";

import Image from "next/image";
import { ImageIcon, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { updateRevistaCover } from "../actions";

type RevistaCoverUploaderProps = {
  revistaId: string;
  titulo: string;
  initialUrl: string | null;
  canEdit: boolean;
};

export default function RevistaCoverUploader({
  revistaId,
  titulo,
  initialUrl,
  canEdit,
}: RevistaCoverUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [coverUrl, setCoverUrl] = useState(initialUrl || "");
  const [isUploading, setIsUploading] = useState(false);

  async function handleFile(file?: File) {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("revistaId", revistaId);
      formData.append("file", file);
      const result = await updateRevistaCover(formData);
      setCoverUrl(result.url);
      toast.success("Capa da revista atualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar capa.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
          <ImageIcon className="h-4 w-4 text-indigo-600" />
          Capa da Revista
        </h2>
        <p className="mt-1 text-xs font-medium text-gray-500">
          Use imagem vertical na proporcao 3:4 para melhor resultado.
        </p>
      </div>

      <div className="mx-auto w-full max-w-[260px]">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
          {coverUrl ? (
            <Image src={coverUrl} alt={`Capa de ${titulo}`} fill sizes="260px" className="object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <ImageIcon className="mb-2 h-8 w-8" />
              <span className="px-4 text-[10px] font-black uppercase tracking-widest">Sem capa cadastrada</span>
            </div>
          )}
        </div>
      </div>

      {canEdit && (
        <div className="mt-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Enviando..." : coverUrl ? "Trocar capa" : "Adicionar capa"}
          </button>
        </div>
      )}
    </div>
  );
}
