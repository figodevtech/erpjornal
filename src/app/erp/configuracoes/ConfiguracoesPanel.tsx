"use client";

import { useState } from "react";
import { BrainCircuit, CalendarDays, ImageIcon, Settings, SlidersHorizontal, Sparkles, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { useConfig } from "../config/ErpConfigProvider";
import { updateMarketTickerEnabled } from "../config/actions";

function formatPercent(usage: number, limit: number) {
  if (limit <= 0) return 100;
  return Math.min(100, Math.round((usage / limit) * 100));
}

function UsageCard({
  title,
  description,
  usage,
  limit,
  icon,
  color,
}: {
  title: string;
  description: string;
  usage: number;
  limit: number;
  icon: React.ReactNode;
  color: "indigo" | "red";
}) {
  const percent = formatPercent(usage, limit);
  const remaining = Math.max(0, limit - usage);
  const colorClass = color === "indigo" ? "bg-indigo-600" : "bg-red-600";
  const lightClass = color === "indigo" ? "bg-indigo-50 text-indigo-700" : "bg-red-50 text-red-700";

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className={`mb-4 inline-flex rounded-xl p-3 ${lightClass}`}>{icon}</div>
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">{description}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-gray-900">{usage}</div>
          <div className="text-xs font-black uppercase tracking-widest text-gray-400">de {limit}</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-gray-500">
          <span>{percent}% utilizado</span>
          <span>{remaining} restantes</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

function ModelInfoCard({
  title,
  model,
  details,
  icon,
}: {
  title: string;
  model: string;
  details: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="rounded-xl bg-gray-100 p-3 text-gray-700">{icon}</div>
        <div className="min-w-0">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">{title}</h3>
          <div className="mt-1 break-all font-mono text-lg font-black text-gray-900">{model}</div>
          <p className="mt-1 text-sm font-medium text-gray-500">{details}</p>
        </div>
      </div>
    </div>
  );
}

export default function ConfiguracoesPanel() {
  const { config, refreshConfig } = useConfig();
  const [savingTicker, setSavingTicker] = useState(false);

  async function handleMarketTickerToggle(enabled: boolean) {
    setSavingTicker(true);
    try {
      await updateMarketTickerEnabled(enabled);
      await refreshConfig();
      toast.success(enabled ? "Barra de mercado ativada." : "Barra de mercado desativada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar configuracao.");
    } finally {
      setSavingTicker(false);
    }
  }

  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm">
            <Settings className="h-3.5 w-3.5 text-red-500" />
            Configuracoes do App
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Configuracoes</h1>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Central de parametros globais do ERP. Novas secoes serao adicionadas aqui.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refreshConfig()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <Sparkles className="h-4 w-4 text-indigo-600" />
          Atualizar uso
        </button>
      </div>

      <section className="rounded-3xl border border-gray-100 bg-gray-50 p-5 md:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-black text-gray-900">
              <BrainCircuit className="h-5 w-5 text-indigo-600" />
              Uso de IA
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-500">
              Contadores mensais para reescrita de artigos e geracao de imagens.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-widest text-gray-500">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            Mes vigente: {config.usageMonth}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <UsageCard
            title="Reescrita de artigos"
            description="Usada na Magica IA do editor e na republicacao RSS."
            usage={config.articleRewriteUsage}
            limit={config.articleRewriteLimit}
            icon={<BrainCircuit className="h-6 w-6" />}
            color="indigo"
          />
          <UsageCard
            title="Geracao de imagens"
            description="Usada para gerar capas novas e recriar imagens vindas do RSS."
            usage={config.imageGenerationUsage}
            limit={config.imageGenerationLimit}
            icon={<ImageIcon className="h-6 w-6" />}
            color="red"
          />
        </div>

        <div className="mt-5 rounded-3xl border border-gray-100 bg-white/70 p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-gray-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-500">Modelos configurados</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ModelInfoCard
              title="Reescrita de artigos"
              model={config.articleRewriteModel}
              details="Modelo usado na Magica IA do editor e na reescrita da curadoria."
              icon={<BrainCircuit className="h-5 w-5" />}
            />
            <ModelInfoCard
              title="Imagem de capa"
              model={config.imageGenerationModel}
              details={`${config.imageGenerationSize} · qualidade ${config.imageGenerationQuality}`}
              icon={<ImageIcon className="h-5 w-5" />}
            />
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-red-50 p-3 text-red-700">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Barra de mercado</h2>
              <p className="mt-1 max-w-2xl text-sm font-medium text-gray-500">
                Controla a exibicao da faixa vermelha com cotacoes de moedas, criptos e acoes na pagina principal do portal.
              </p>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={config.marketTickerEnabled}
            disabled={savingTicker}
            onClick={() => handleMarketTickerToggle(!config.marketTickerEnabled)}
            className={`relative inline-flex h-9 w-16 shrink-0 items-center rounded-full border-2 p-1 transition disabled:opacity-60 ${
              config.marketTickerEnabled
                ? "border-emerald-500 bg-emerald-500"
                : "border-gray-200 bg-gray-200"
            }`}
          >
            <span
              className={`h-6 w-6 rounded-full bg-white shadow transition-transform ${
                config.marketTickerEnabled ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-gray-200 bg-white p-6">
        <h2 className="text-lg font-black text-gray-900">Proximas configuracoes</h2>
        <p className="mt-1 text-sm font-medium text-gray-500">
          Este modulo fica preparado para receber parametros de modelos GPT, limites por plano, storage, integracoes e
          preferencias editoriais.
        </p>
      </section>
    </div>
  );
}
