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

function createRateLimiter(limit: number, window: Duration, prefix: string): RateLimiter {
  if (!isRedisConfigured || !upstashRedis) {
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

export function getIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwardedFor) return forwardedFor.split(",")[0];
  if (realIp) return realIp;

  return "127.0.0.1";
}
