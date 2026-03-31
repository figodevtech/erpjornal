import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  
  // Amostragem de performance: 100% de transações capturadas
  tracesSampleRate: 1.0,

  // Replay de Sessão: captura erros críticos com vídeo do que o usuário fez
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],

  // Alvos de propagação de rastreamento para evitar CORS
  tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],

  // Ativa logs estruturados para debug
  enableLogs: true,
});

// Hook para capturar transições do App Router
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
