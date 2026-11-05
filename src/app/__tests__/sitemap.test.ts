import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";

import sitemap from "../sitemap";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artigo: { findMany: vi.fn() },
    categoria: { findMany: vi.fn() },
    revista: { findMany: vi.fn() },
    episodioPodcast: { findMany: vi.fn() },
    politico: { findMany: vi.fn() },
    tag: { findMany: vi.fn() },
  },
}));

describe("sitemap", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://revistagestao.com.br");
    vi.mocked(prisma.artigo.findMany).mockResolvedValue([
      { slug: "artigo-1", atualizadoEm: new Date() },
    ] as never);
    vi.mocked(prisma.categoria.findMany).mockResolvedValue([{ slug: "economia" }] as never);
    vi.mocked(prisma.revista.findMany).mockResolvedValue([{ id: "rev-1", updatedAt: new Date() }] as never);
    vi.mocked(prisma.episodioPodcast.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.politico.findMany).mockResolvedValue([{ slug: "fulano-de-tal", atualizadoEm: new Date() }] as never);
    vi.mocked(prisma.tag.findMany).mockResolvedValue([{ slug: "reforma-tributaria" }] as never);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("inclui home, institucionais, categorias, matérias e revistas com a URL do site", async () => {
    const urls = (await sitemap()).map((item) => item.url);

    expect(urls).toContain("https://revistagestao.com.br");
    expect(urls).toContain("https://revistagestao.com.br/sobre");
    expect(urls).toContain("https://revistagestao.com.br/politica-de-privacidade");
    expect(urls).toContain("https://revistagestao.com.br/categoria/economia");
    expect(urls).toContain("https://revistagestao.com.br/noticia/artigo-1");
    expect(urls).toContain("https://revistagestao.com.br/revistas/rev-1");
  });

  it("inclui perfis de políticos e só tags com matéria no ar", async () => {
    const urls = (await sitemap()).map((item) => item.url);

    expect(urls).toContain("https://revistagestao.com.br/politico/fulano-de-tal");
    expect(urls).toContain("https://revistagestao.com.br/tag/reforma-tributaria");
    const consultaTags = vi.mocked(prisma.tag.findMany).mock.calls[0][0];
    expect(consultaTags?.where).toMatchObject({
      artigos: { some: { artigo: { status: "publicado", excluidoEm: null } } },
    });
  });

  it("não lista seções desligadas (podcasts e vídeos estão desativados)", async () => {
    const urls = (await sitemap()).map((item) => item.url);

    expect(urls.some((url) => url.includes("/podcasts"))).toBe(false);
    expect(urls.some((url) => url.includes("/videos"))).toBe(false);
    expect(prisma.episodioPodcast.findMany).not.toHaveBeenCalled();
  });

  it("só lista matérias publicadas e já no ar (agendadas ficam de fora)", async () => {
    await sitemap();

    const consulta = vi.mocked(prisma.artigo.findMany).mock.calls[0][0];
    expect(consulta?.where).toMatchObject({ status: "publicado", dataPublicacao: { lte: expect.any(Date) } });
  });
});
