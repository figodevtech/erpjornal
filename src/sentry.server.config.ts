import * as Sentry from "@sentry/nextjs";

import { COLETA_DE_DADOS, TAXA_AMOSTRAGEM_TRACES } from "@/lib/observabilidade/sentry";

// Sentry no runtime Node.js (carregado por src/instrumentation.ts).
Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  tracesSampleRate: TAXA_AMOSTRAGEM_TRACES,
  dataCollection: COLETA_DE_DADOS,
});
