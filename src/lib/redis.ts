import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRedisConfigured = Boolean(redisUrl && redisToken);
export const upstashRedis = isRedisConfigured
  ? new Redis({
      url: redisUrl!,
      token: redisToken!,
    })
  : null;

type PipelineCommand = [unknown, unknown];

type RedisPipelineLike = {
  incr(key: string): void;
  zincrby(key: string, increment: number, member: string): void;
  exec(): Promise<PipelineCommand[]>;
};

export type RedisLike = {
  get<T = unknown>(key: string): Promise<T | null>;
  set(key: string, value: unknown, options?: Record<string, unknown>): Promise<unknown>;
  incr(key: string): Promise<number>;
  zincrby(key: string, increment: number, member: string): Promise<number>;
  zadd(key: string, input: { score: number; member: string }): Promise<number>;
  zrange(
    key: string,
    start: number,
    stop: number,
    options?: Record<string, unknown>
  ): Promise<unknown[]>;
  pipeline(): RedisPipelineLike;
};

const noopRedis: RedisLike = {
  async get() {
    return null;
  },
  async set() {
    return null;
  },
  async incr() {
    return 0;
  },
  async zincrby() {
    return 0;
  },
  async zadd() {
    return 0;
  },
  async zrange() {
    return [];
  },
  pipeline() {
    const commands: PipelineCommand[] = [];

    return {
      incr() {
        commands.push([null, 0]);
      },
      zincrby() {
        commands.push([null, 0]);
      },
      async exec() {
        return commands;
      },
    };
  },
};

const configuredRedis: RedisLike | null = upstashRedis
  ? {
      async get<T = unknown>(key: string) {
        return (await upstashRedis.get(key)) as T | null;
      },
      async set(key: string, value: unknown, options?: Record<string, unknown>) {
        return upstashRedis.set(key, value, options as never);
      },
      async incr(key: string) {
        return Number(await upstashRedis.incr(key));
      },
      async zincrby(key: string, increment: number, member: string) {
        return Number(await upstashRedis.zincrby(key, increment, member));
      },
      async zadd(key: string, input: { score: number; member: string }) {
        return Number(await upstashRedis.zadd(key, input));
      },
      async zrange(key: string, start: number, stop: number, options?: Record<string, unknown>) {
        return (await upstashRedis.zrange(key, start, stop, options as never)) as unknown[];
      },
      pipeline() {
        const pipeline = upstashRedis.pipeline();

        return {
          incr(key: string) {
            pipeline.incr(key);
          },
          zincrby(key: string, increment: number, member: string) {
            pipeline.zincrby(key, increment, member);
          },
          async exec() {
            return (await pipeline.exec()) as PipelineCommand[];
          },
        };
      },
    }
  : null;

export const redis: RedisLike = configuredRedis ?? noopRedis;

export const redisKeys = {
  artigoViews: (id: string) => `artigo:${id}:views`,
  popularArticles: "portal:popular_artigos",
  categoryCache: (slug: string) => `category:${slug}:cache`,
  artigosList: (page: number, limit: number, category?: string) =>
    `artigos:list:${page}:${limit}:${category || "all"}`,
  globalStats: "portal:stats",
};
