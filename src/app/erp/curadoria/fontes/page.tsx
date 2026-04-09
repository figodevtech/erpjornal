import { Globe, Link as LinkIcon, MapPin, RefreshCcw } from "lucide-react";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { HarvestButton } from "./components/HarvestButton";
import { RSSSourceForm } from "./components/RSSSourceForm";
import { StatusToggle } from "./components/StatusToggle";

export default async function FontesCuradoriaPage() {
  await exigirPermissao("curadoria:gerir");

  const fontes = await prisma.fonteRss.findMany({
    orderBy: { criadoEm: "desc" },
    include: {
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-gray-900">Fontes RSS</h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Gerencie os portais parceiros para curadoria automatizada.
          </p>
        </div>
        <RSSSourceForm />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {fontes.map((fonte) => (
          <div
            key={fonte.id}
            className="group relative overflow-hidden rounded-[32px] border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:border-gray-300 hover:shadow-2xl"
          >
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-32 w-32 rounded-full bg-gray-50 transition-colors duration-700 group-hover:bg-indigo-50" />

            <div className="relative z-10 flex h-full flex-col p-8">
              <div className="mb-8 flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gray-900 shadow-xl transition-transform duration-500 group-hover:rotate-3">
                    {fonte.logo ? (
                      <img src={fonte.logo} alt="" className="h-10 w-10 object-contain brightness-0 invert" />
                    ) : (
                      <Globe className="h-8 w-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-black uppercase leading-none tracking-tight text-gray-900">
                      {fonte.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusToggle id={fonte.id} isActive={(fonte as any).ativa} />
                      <span className="rounded-xl border border-indigo-100 bg-indigo-50 px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-indigo-600">
                        {fonte.tone || "Jornalistico"}
                      </span>
                      {fonte.regiao && (
                        <span className="flex items-center gap-1.5 border-l border-gray-100 pl-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                          <MapPin className="h-3.5 w-3.5 text-red-500" /> {fonte.regiao}{" "}
                          {fonte.estado && `(${fonte.estado})`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <HarvestButton sourceId={fonte.id} />
                </div>
              </div>

              <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-gray-100 bg-gray-50/80 p-4 backdrop-blur-sm">
                  <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Acervo Local
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tighter text-gray-900">{fonte._count.items}</span>
                    <span className="text-[10px] font-bold uppercase italic text-gray-400">materias</span>
                  </div>
                </div>
                <div className="rounded-3xl border border-gray-100 bg-gray-50/80 p-4 backdrop-blur-sm">
                  <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                    Ciclo Automatico
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tighter text-gray-900">{fonte.cacheTtl}</span>
                    <span className="text-[10px] font-bold uppercase italic text-gray-400">min</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-6">
                <div className="flex flex-col">
                  <span className="mb-1 text-[9px] font-black uppercase tracking-widest text-gray-400">
                    Status da Pulsacao
                  </span>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tight text-gray-600">
                    <RefreshCcw className={`h-3.5 w-3.5 text-emerald-500 ${fonte.lastHarvest ? "" : "animate-spin"}`} />
                    <span className="max-w-[150px] truncate">
                      Ultima:{" "}
                      {fonte.lastHarvest
                        ? new Date(fonte.lastHarvest).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Inativa"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RSSSourceForm source={fonte} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 truncate rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-3 font-mono text-[10px] text-gray-400 opacity-60 transition-opacity hover:opacity-100">
                <LinkIcon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{fonte.urlFeed}</span>
              </div>
            </div>
          </div>
        ))}

        {fontes.length === 0 && (
          <div className="lg:col-span-2 rounded-[40px] border-2 border-dashed border-gray-200 bg-white/50 py-32 text-center">
            <Globe className="mx-auto mb-4 h-16 w-16 text-gray-200" />
            <h3 className="text-xl font-black uppercase text-gray-900">Nenhum feed RSS</h3>
            <p className="mx-auto mt-2 max-w-xs font-medium text-gray-500">
              Cadastre o link de um portal para comecar a receber noticias filtradas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
