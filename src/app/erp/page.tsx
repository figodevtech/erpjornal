import Link from "next/link";
import { CalendarClock, CheckCircle, Clock, Eye, FileText, Search, TrendingUp } from "lucide-react";

import { exigirAcessoErp, temAlgumaPermissao } from "@/lib/auth";
import { obterEstatisticasEditoriais } from "@/lib/data/dashboard";
import { ETAPAS_FLUXO, STATUS_INFO } from "@/lib/editorial/status";

export const dynamic = "force-dynamic";

export default async function ERPDashboardPage() {
  const session = await exigirAcessoErp();
  const { contagens, populares } = await obterEstatisticasEditoriais();
  const podeCriarArtigos = temAlgumaPermissao(session, [
    "artigos:criar",
    "artigos:editar",
    "artigos:publicar",
  ]);

  const cards = [
    { title: "Em produção", value: contagens.emProducao, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Em revisão", value: contagens.emRevisao, icon: Search, color: "text-orange-600", bg: "bg-orange-50" },
    { title: "Publicadas", value: contagens.publicadas, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Agendadas", value: contagens.agendadas, icon: CalendarClock, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Dashboard Editorial</h1>
        <p className="mt-1 text-gray-500">Indicadores de performance e monitoramento de conteúdo em tempo real.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className={`${card.bg} rounded-xl p-2.5`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <TrendingUp className="h-4 w-4 text-gray-300" />
            </div>
            <div className="text-4xl font-black text-gray-900">{card.value}</div>
            <div className="mt-1 text-sm font-semibold uppercase tracking-wider text-gray-500">{card.title}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-50 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-2">
                <Eye className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="font-bold text-gray-900">Top 5 - Mais visualizadas</h2>
            </div>
          </div>

          <div className="flex-1">
            {populares.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {populares.map((artigo, idx) => (
                  <div key={artigo.id} className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50">
                    <span className="w-8 text-2xl font-black text-gray-200">0{idx + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-gray-900">{artigo.titulo}</div>
                      <div className="text-xs text-gray-500">/{artigo.slug}</div>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-red-50 px-3 py-1">
                      <span className="text-xs font-black text-red-700">{artigo.visualizacoes}</span>
                      <Eye className="h-3 w-3 text-red-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center italic text-gray-400">Nenhum dado de audiencia registrado.</div>
            )}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-3xl bg-gray-900 p-8 text-white shadow-xl shadow-gray-200/50">
          <div>
            <h3 className="mb-6 text-xl font-bold">Status da Producao</h3>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Publicadas</span>
                  <span>{Math.round((contagens.publicadas / (contagens.total || 1)) * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(contagens.publicadas / (contagens.total || 1)) * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Em produção</span>
                  <span>{Math.round((contagens.emProducao / (contagens.total || 1)) * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${(contagens.emProducao / (contagens.total || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {ETAPAS_FLUXO.map((etapa) => (
                <div key={etapa} className="flex justify-between border-b border-gray-800 pb-1">
                  <dt className="text-gray-400">{STATUS_INFO[etapa].label}</dt>
                  <dd className="font-black">{contagens.porEtapa[etapa]}</dd>
                </div>
              ))}
              <div className="flex justify-between border-b border-gray-800 pb-1">
                <dt className="text-gray-400">Total</dt>
                <dd className="font-black">{contagens.total}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8">
            {podeCriarArtigos && (
              <Link
                href="/erp/artigos/novo"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 font-black text-white shadow-lg shadow-red-900/40 transition-all hover:bg-red-700"
              >
                <FileText className="h-5 w-5" />
                NOVA MATERIA
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
