import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  
  // Amostragem para leves execuções na borda (Edge Functions)
  tracesSampleRate: 1.0,
  
  enableLogs: true,
});
