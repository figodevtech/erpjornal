"use client";

import Link from "next/link";
import { useTransition } from "react";

import CustomSelect from "@/components/ui/CustomSelect";

import { saveSource } from "../actions";

type FonteFormProps = {
  onCancel?: () => void;
};

export default function FonteForm({ onCancel }: FonteFormProps) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => saveSource(formData));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">
            Nome <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="nome"
            required
            placeholder="Ex: João Silva"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Cargo</label>
          <input
            type="text"
            name="cargo"
            placeholder="Ex: Secretário de Estado"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Organização</label>
          <input
            type="text"
            name="organizacao"
            placeholder="Ex: Prefeitura de SP"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Email</label>
          <input
            type="email"
            name="email"
            placeholder="contato@exemplo.gov.br"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Telefone</label>
          <input
            type="tel"
            name="telefone"
            placeholder="(11) 9 9999-9999"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Nível de Sigilo</label>
          <CustomSelect
            name="nivelSigilo"
            defaultValue="publico"
            options={[
              { value: "publico", label: "Público - Visível a todos os repórteres" },
              { value: "reservado", label: "Reservado - Apenas editores e admin" },
              { value: "confidencial", label: "Confidencial - Apenas admin" },
            ]}
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-gray-500">Notas Gerais</label>
          <textarea
            name="notas"
            rows={3}
            placeholder="Informações adicionais sobre a fonte..."
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none transition-all focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
          >
            Cancelar
          </button>
        ) : (
          <Link
            href="/erp/fontes"
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
          >
            Cancelar
          </Link>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {isPending ? "Cadastrando..." : "Cadastrar Fonte"}
        </button>
      </div>
    </form>
  );
}
