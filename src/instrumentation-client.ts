import * as Sentry from "@sentry/nextjs";

import { COLETA_DE_DADOS, TAXA_AMOSTRAGEM_TRACES } from "@/lib/observabilidade/sentry";

/**
 * Monitoramento do navegador (convenção do Next 16: roda antes da hidratação).
 * Substitui o antigo sentry.client.config.ts, que não é carregado pelo Turbopack.
 * Sem NEXT_PUBLIC_SENTRY_DSN o Sentry fica desligado.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  tracesSampleRate: TAXA_AMOSTRAGEM_TRACES,
  dataCollection: COLETA_DE_DADOS,

  // Replay de sessão: 10% das sessões e 100% das que tiverem erro.
  // Textos e mídias ficam mascarados (padrão do replayIntegration).
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
});

// Instrumenta as navegações do App Router.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
