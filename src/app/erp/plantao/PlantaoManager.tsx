"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Radio, Send, XCircle } from "lucide-react";
import { toast } from "sonner";

import {
  MAX_PLANTOES_ATIVOS,
  PRAZOS_PLANTAO_HORAS,
  TAMANHO_MAXIMO_TEXTO_PLANTAO,
  rotuloPrazo,
} from "@/lib/plantao";

import { encerrarPlantao, publicarPlantao } from "./actions";

type PlantaoItem = {
  id: string;
  texto: string;
  link: string | null;
  noAr: boolean;
  encerrado: boolean;
  expiraEm: string | null;
  criadoEm: string;
  autor: string;
  materia: { titulo: string; slug: string } | null;
};

const hora = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

const campo =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";

export default function PlantaoManager({
  plantoes,
  materias,
}: {
  plantoes: PlantaoItem[];
  materias: { id: string; titulo: string }[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [texto, setTexto] = useState("");
  const [publicando, startPublicacao] = useTransition();
  const [encerrandoId, setEncerrandoId] = useState<string | null>(null);

  const noAr = plantoes.filter((plantao) => plantao.noAr);
  const historico = plantoes.filter((plantao) => !plantao.noAr);

  function publicar(formData: FormData) {
    startPublicacao(async () => {
      const resultado = await publicarPlantao(formData);
      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }
      toast.success("Aviso no ar. O portal mostra em até 1 minuto.");
      formRef.current?.reset();
      setTexto("");
      router.refresh();
    });
  }

  async function encerrar(id: string) {
    setEncerrandoId(id);
    try {
      const resultado = await encerrarPlantao(id);
      if (!resultado.ok) {
        toast.error(resultado.error);
        return;
      }
      toast.success("Aviso encerrado.");
      router.refresh();
    } finally {
      setEncerrandoId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-gray-900">
          <Radio className="h-7 w-7 text-red-600" /> Plantão
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Avisos curtos na faixa vermelha do topo do portal. No máximo {MAX_PLANTOES_ATIVOS} no ar: ao publicar o
          próximo, o mais antigo sai sozinho.
        </p>
      </div>

      <form ref={formRef} action={publicar} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="block space-y-1 text-sm font-semibold text-gray-800">
          Aviso
          <textarea
            name="texto"
            required
            rows={2}
            maxLength={TAMANHO_MAXIMO_TEXTO_PLANTAO}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            className={campo}
            placeholder="Ex.: STF forma maioria para manter a decisão sobre as emendas"
          />
          <span className="block text-right text-xs font-normal text-gray-400">
            {texto.length}/{TAMANHO_MAXIMO_TEXTO_PLANTAO}
          </span>
        </label>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block space-y-1 text-sm font-semibold text-gray-800">
            Matéria relacionada (opcional)
            <select name="artigoId" defaultValue="" className={campo}>
              <option value="">Nenhuma</option>
              {materias.map((materia) => (
                <option key={materia.id} value={materia.id}>
                  {materia.titulo.length > 70 ? `${materia.titulo.slice(0, 70)}…` : materia.titulo}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm font-semibold text-gray-800">
            Ou link externo (opcional)
            <input type="url" name="link" placeholder="https://" className={campo} />
          </label>
          <label className="block space-y-1 text-sm font-semibold text-gray-800">
            Fica no ar por
            <select name="prazoHoras" defaultValue="3" className={campo}>
              {PRAZOS_PLANTAO_HORAS.map((horas) => (
                <option key={horas} value={horas}>
                  {rotuloPrazo(horas)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="submit"
          disabled={publicando}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {publicando ? "Publicando…" : "Publicar aviso"}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">No ar ({noAr.length})</h2>
        {noAr.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
            Nenhum aviso no ar. A faixa do portal fica escondida.
          </p>
        ) : (
          <ul className="space-y-2">
            {noAr.map((plantao) => (
              <li
                key={plantao.id}
                className="flex flex-col gap-3 rounded-xl border border-red-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{plantao.texto}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {plantao.autor} · {hora(plantao.criadoEm)}
                    {plantao.expiraEm ? ` · sai às ${hora(plantao.expiraEm)}` : " · até encerrar"}
                    {plantao.materia && ` · matéria: ${plantao.materia.titulo}`}
                    {!plantao.materia && plantao.link && ` · link: ${plantao.link}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void encerrar(plantao.id)}
                  disabled={encerrandoId === plantao.id}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  {encerrandoId === plantao.id ? "Encerrando…" : "Encerrar"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {historico.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-500">Encerrados e expirados</h2>
          <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {historico.map((plantao) => (
              <li key={plantao.id} className="px-4 py-3">
                <p className="text-sm text-gray-700">{plantao.texto}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {plantao.autor} · {hora(plantao.criadoEm)} · {plantao.encerrado ? "encerrado" : "expirou"}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
