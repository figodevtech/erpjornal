"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

import FonteForm from "./FonteForm";

type NovaFonteDialogProps = {
  label?: string;
};

export default function NovaFonteDialog({ label = "Nova Fonte" }: NovaFonteDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
      >
        <Plus className="h-4 w-4" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-6">
              <div>
                <h2 className="text-xl font-black text-gray-900">Nova Fonte</h2>
                <p className="mt-1 text-sm text-gray-500">Cadastre um contato jornalístico ou governamental.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <FonteForm onCancel={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
