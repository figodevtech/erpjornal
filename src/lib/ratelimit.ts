import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

/**
 * Configurador de Rate Limiting (Upstash).
 * Utiliza o algoritmo "Sliding Window" para maior precisão.
 */

// 1. Limite para Busca (ex: 10 buscas a cada 10 segundos por IP)
export const searchRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@ratelimit/search",
});

// 2. Limite Global/API (ex: 60 requisições por minuto por IP)
export const globalRateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "@ratelimit/global",
});

/**
 * Helper para extrair o IP do usuário no Next.js (App Router/Middleware)
 */
export function getIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  
  if (forwardedFor) return forwardedFor.split(",")[0];
  if (realIp) return realIp;
  
  return "127.0.0.1"; // Fallback para local
}
