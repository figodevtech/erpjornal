import { describe, it, expect, vi, beforeEach } from "vitest";
import { incrementArticleViews, getArticleViews } from "@/app/actions/analytics";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

// Mock das dependências
vi.mock("@/lib/redis", () => ({
  redis: {
    incr: vi.fn(),
    zadd: vi.fn(),
    get: vi.fn(),
  },
  redisKeys: {
    artigoViews: (id: string) => `artigo:${id}:views`,
    popularArticles: "portal:popular_artigos",
  }
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artigo: {
      findUnique: vi.fn(),
    }
  }
}));

describe("Analytics Actions (Redis)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve incrementar views no Redis e atualizar o ranking (Sorted Set)", async () => {
    const artigoId = "artigo-123";
    vi.mocked(redis.incr).mockResolvedValue(10);
    vi.mocked(redis.zadd).mockResolvedValue(1);

    const result = await incrementArticleViews(artigoId);

    expect(result).toBe(10);
    expect(redis.incr).toHaveBeenCalledWith(`artigo:${artigoId}:views`);
    expect(redis.zadd).toHaveBeenCalledWith("portal:popular_artigos", { score: 10, member: artigoId });
  });

  it("deve recuperar views do Redis se existirem", async () => {
    const artigoId = "artigo-123";
    vi.mocked(redis.get).mockResolvedValue(50);

    const result = await getArticleViews(artigoId);

    expect(result).toBe(50);
    expect(redis.get).toHaveBeenCalled();
    expect(prisma.artigo.findUnique).not.toHaveBeenCalled();
  });

  it("deve fazer fallback para o Prisma se o Redis não tiver o dado", async () => {
    const artigoId = "artigo-123";
    vi.mocked(redis.get).mockResolvedValue(null);
    vi.mocked(prisma.artigo.findUnique).mockResolvedValue({ visualizacoes: 5 } as any);

    const result = await getArticleViews(artigoId);

    expect(result).toBe(5);
    expect(prisma.artigo.findUnique).toHaveBeenCalled();
  });
});
