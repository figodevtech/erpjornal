"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

import type { PlantaoPublico } from "@/lib/plantao";

const INTERVALO_CONSULTA_MS = 60_000;
const INTERVALO_TROCA_MS = 7_000;

/**
 * Faixa de plantão no topo do portal. As páginas são estáticas (ISR), então os
 * avisos vêm do navegador: /api/plantao a cada 60s, só com a aba visível.
 */
export default function PlantaoTicker() {
  const [plantoes, setPlantoes] = useState<PlantaoPublico[]>([]);
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      if (document.visibilityState === "hidden") return;
      try {
        const resposta = await fetch("/api/plantao", { cache: "no-store" });
        if (!resposta.ok) return;
        const dados = (await resposta.json()) as { plantoes?: PlantaoPublico[] };
        if (!cancelado) setPlantoes(Array.isArray(dados.plantoes) ? dados.plantoes : []);
      } catch {
        // Sem rede: mantém o que já está na tela.
      }
    }
    void carregar();
    const intervalo = window.setInterval(() => void carregar(), INTERVALO_CONSULTA_MS);
    document.addEventListener("visibilitychange", carregar);
    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", carregar);
    };
  }, []);

  useEffect(() => {
    if (plantoes.length < 2 || pausado) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intervalo = window.setInterval(() => setIndice((atual) => atual + 1), INTERVALO_TROCA_MS);
    return () => window.clearInterval(intervalo);
  }, [plantoes.length, pausado]);

  if (plantoes.length === 0) return null;

  const posicao = indice % plantoes.length;
  const atual = plantoes[posicao];
  const externo = atual.href?.startsWith("http");

  return (
    <section
      aria-label="Plantão"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
      className="w-full border-b border-yellow-500 bg-yellow-300 text-gray-950"
    >
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <span className="flex shrink-0 items-center gap-1.5 rounded-sm bg-red-700 px-2 py-0.5 text-[11px] font-black uppercase tracking-widest text-white">
          <span className="size-1.5 rounded-full bg-white motion-safe:animate-pulse" aria-hidden />
          Plantão
        </span>
        <p className="min-w-0 flex-1 truncate text-sm font-bold" title={atual.texto}>
          {atual.href ? (
            externo ? (
              <a href={atual.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {atual.texto}
              </a>
            ) : (
              <Link href={atual.href} className="hover:underline">
                {atual.texto}
              </Link>
            )
          ) : (
            atual.texto
          )}
        </p>
        {plantoes.length > 1 && (
          <button
            type="button"
            onClick={() => setIndice(posicao + 1)}
            className="flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-black tabular-nums hover:bg-yellow-400"
            aria-label={`Próximo aviso (${posicao + 1} de ${plantoes.length})`}
          >
            {posicao + 1}/{plantoes.length}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>
    </section>
  );
}
