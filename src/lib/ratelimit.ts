import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { isRedisConfigured, upstashRedis } from "./redis";

type RateLimitResponse = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

type RateLimiter = {
  limit(identifier: string): Promise<RateLimitResponse>;
};

function createNoopRateLimiter(limit: number): RateLimiter {
  return {
    async limit() {
      return {
        success: true,
        limit,
        remaining: limit,
        reset: Date.now(),
      };
    },
  };
}

let avisoSemRedisDado = false;

function createRateLimiter(limit: number, window: Duration, prefix: string): RateLimiter {
  if (!isRedisConfigured || !upstashRedis) {
    // Sem Redis, nenhum limite vale (busca, newsletter, views): em produção isso é falha de configuração.
    if (process.env.NODE_ENV === "production" && !avisoSemRedisDado) {
      avisoSemRedisDado = true;
      console.warn(
        "[ratelimit] UPSTASH_REDIS_REST_URL/TOKEN ausentes: rate limit DESLIGADO. Configure o Redis em produção."
      );
    }
    return createNoopRateLimiter(limit);
  }

  const ratelimit = new Ratelimit({
    redis: upstashRedis,
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix,
  });

  return {
    limit(identifier: string) {
      return ratelimit.limit(identifier);
    },
  };
}

export const searchRateLimit = createRateLimiter(10, "10 s", "@ratelimit/search");
export const globalRateLimit = createRateLimiter(60, "1 m", "@ratelimit/global");
/** Uma visualização contada por IP e matéria a cada 30 minutos (chave: `${ip}:${slug}`). */
export const viewRateLimit = createRateLimiter(1, "30 m", "@ratelimit/view");
/** Inscrições na newsletter: 5 por IP a cada 10 minutos. */
export const newsletterRateLimit = createRateLimiter(5, "10 m", "@ratelimit/newsletter");
/** Página /busca (renderizada a cada acesso): 30 por IP por minuto. */
export const paginaBuscaRateLimit = createRateLimiter(30, "1 m", "@ratelimit/busca-pagina");

/**
 * IP do visitante. Na Vercel, `x-forwarded-for` é reescrito pela plataforma
 * (o cliente não consegue forjar). Atrás de outro proxy, confira se ele faz o mesmo.
 */
export function ipDosCabecalhos(cabecalhos: Pick<Headers, "get">): string {
  const forwardedFor = cabecalhos.get("x-forwarded-for");
  const realIp = cabecalhos.get("x-real-ip");

  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

export function getIP(request: Request): string {
  return ipDosCabecalhos(request.headers);
}
