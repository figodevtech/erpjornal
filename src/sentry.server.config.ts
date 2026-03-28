import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // Nota: No Server Side usamos SENTRY_DSN (privado) ou o publico se necessário
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || "",

  // Performance e rastreabilidade para o Banco de Dados
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

  // Captura variáveis locais no momento do erro para debug profundo
  includeLocalVariables: true,

  // Integração com logs (Pino/Winston) se detectados
  enableLogs: true,
});
