import * as Sentry from "@sentry/nextjs";

/**
 * Registro unificado de Sentry para Next.js 16.
 * Carrega a configuração correta baseada no Runtime de execução (Node.js vs Edge).
 * Ativa o capturador de erros de requisição global 'onRequestError'.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Ativa captura global de erros de rede e execução server-side (Next.js 15+)
export const onRequestError = Sentry.captureRequestError;
