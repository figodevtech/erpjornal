import { beforeEach, describe, expect, it, vi } from "vitest";

import { obterVisualizacoes, registrarVisualizacao } from "@/lib/analytics/visualizacoes";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const pipeline = {
  incr: vi.fn(),
  zincrby: vi.fn(),
  exec: vi.fn(),
};

vi.mock("@/lib/redis", () => ({
  redis: {
    get: vi.fn(),
    pipeline: vi.fn(() => pipeline),
  },
  redisKeys: {
    artigoViews: (id: string) => `artigo:${id}:views`,
    popularArticles: "portal:popular_artigos",
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artigo: {
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/logger", () => ({ default: { error: vi.fn(), info: vi.fn() } }));

describe("Visualizações (Redis + Postgres)", () => {
  const artigoId = "artigo-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("incrementa o contador no Redis, o ranking e o Postgres", async () => {
    pipeline.exec.mockResolvedValue([
      [null, 10],
      [null, 1],
    ]);
    vi.mocked(prisma.artigo.update).mockResolvedValue({} as never);

    const total = await registrarVisualizacao(artigoId);

    expect(total).toBe(10);
    expect(pipeline.incr).toHaveBeenCalledWith(`artigo:${artigoId}:views`);
    expect(pipeline.zincrby).toHaveBeenCalledWith("portal:popular_artigos", 1, artigoId);
    expect(prisma.artigo.update).toHaveBeenCalledWith({
      where: { id: artigoId },
      data: { visualizacoes: { increment: 1 } },
    });
  });

  it("não quebra a página se o registro falhar", async () => {
    pipeline.exec.mockRejectedValue(new Error("redis fora"));
    await expect(registrarVisualizacao(artigoId)).resolves.toBeNull();
  });

  it("lê a contagem do Redis quando disponível", async () => {
    vi.mocked(redis.get).mockResolvedValue(50);
    await expect(obterVisualizacoes(artigoId)).resolves.toBe(50);
    expect(prisma.artigo.findUnique).not.toHaveBeenCalled();
  });

  it("usa o Postgres quando o Redis não tem a contagem", async () => {
    vi.mocked(redis.get).mockResolvedValue(null);
    vi.mocked(prisma.artigo.findUnique).mockResolvedValue({ visualizacoes: 5 } as never);
    await expect(obterVisualizacoes(artigoId)).resolves.toBe(5);
  });
});
