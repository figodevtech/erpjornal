"use client";

import { useState, useTransition } from "react";
import { UploadCloud, Loader2, X } from "lucide-react";

interface Props {
  mediaKitId: string;
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploadField({ mediaKitId, value, onChange, label = "Imagem" }: Props) {
  const [isUploading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mediaKitId", mediaKitId);
        formData.append("tipo", "image");

        const res = await fetch("/api/midia-kit/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Erro no upload");
        }

        onChange(data.url);
      } catch (err: any) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      
      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-gray-200">
          <img src={value} alt="Preview" className="h-40 w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-gray-700 shadow-sm hover:bg-red-50 hover:text-red-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-rose-400 hover:bg-rose-50 transition">
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-rose-500">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-xs font-semibold">Enviando...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-rose-500">
              <UploadCloud className="h-6 w-6" />
              <span className="text-xs font-semibold">Clique ou arraste uma imagem</span>
            </div>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
