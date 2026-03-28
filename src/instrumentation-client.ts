import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  
  // Amostragem de performance: 100% no dev, 10% no prod
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Replay de Sessão: captura erros críticos com vídeo do que o usuário fez
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
  ],

  // Ativa logs estruturados para debug
  enableLogs: true,
});

// Hook para capturar transições do App Router
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
