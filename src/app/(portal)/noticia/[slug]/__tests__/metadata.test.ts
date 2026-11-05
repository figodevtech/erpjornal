import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";

import { generateMetadata } from "../page";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    artigo: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  obterSessao: vi.fn(),
}));

vi.mock("@/components/portal/NewsletterForm", () => ({
  default: () => null,
}));

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });

describe("Metadados da notícia", () => {
  beforeEach(() => {
    vi.mocked(prisma.artigo.findFirst).mockReset();
  });

  it("monta título, descrição e Open Graph de uma matéria publicada", async () => {
    vi.mocked(prisma.artigo.findFirst).mockResolvedValue({
      titulo: "Notícia de Teste",
      slug: "noticia-de-teste",
      resumo: "Este é um resumo de teste.",
      dataPublicacao: new Date("2026-03-24T12:00:00Z"),
    } as never);

    const metadata = await generateMetadata(params("noticia-de-teste"));

    expect(metadata.title).toBe("Notícia de Teste | Revista Gestão");
    expect(metadata.description).toBe("Este é um resumo de teste.");
    expect(metadata.openGraph?.title).toBe("Notícia de Teste");
  });

  it("só consulta matérias publicadas e já no ar (rascunho/agendada não vazam)", async () => {
    vi.mocked(prisma.artigo.findFirst).mockResolvedValue(null);

    await generateMetadata(params("rascunho-secreto"));

    const consulta = vi.mocked(prisma.artigo.findFirst).mock.calls[0][0];
    expect(consulta?.where).toMatchObject({
      slug: "rascunho-secreto",
      status: "publicado",
      dataPublicacao: { lte: expect.any(Date) },
    });
  });

  it("usa título padrão quando a matéria não existe ou não está no ar", async () => {
    vi.mocked(prisma.artigo.findFirst).mockResolvedValue(null);

    const metadata = await generateMetadata(params("nao-existe"));

    expect(metadata.title).toBe("Artigo não encontrado");
  });
});
