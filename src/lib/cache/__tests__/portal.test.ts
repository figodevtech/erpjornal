import fs from "node:fs";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }));

import { revalidatePath, updateTag } from "next/cache";

import {
  PADROES_PORTAL,
  TAG_CATEGORIAS,
  revalidarCategorias,
  revalidarMateriasNoPortal,
  revalidarPortalInteiro,
} from "@/lib/cache/portal";

const APP = path.resolve(__dirname, "../../../app");

describe("padrões de revalidação do portal", () => {
  it("cada padrão é o caminho de um page.tsx real (com o route group)", () => {
    for (const padrao of Object.values(PADROES_PORTAL)) {
      // O Next monta as tags de cache a partir do caminho do arquivo; sem o
      // "(portal)" o revalidatePath não invalida nada (bug corrigido na Fase 5c).
      expect(fs.existsSync(path.join(APP, padrao, "page.tsx")), `${padrao}/page.tsx`).toBe(true);
    }
  });

  it("o layout do portal existe para a revalidação geral", () => {
    expect(fs.existsSync(path.join(APP, "(portal)", "layout.tsx"))).toBe(true);
  });

  it("matérias: home, edições anteriores e todos os tipos de página", () => {
    vi.mocked(revalidatePath).mockClear();
    revalidarMateriasNoPortal();
    const chamadas = vi.mocked(revalidatePath).mock.calls;
    expect(chamadas).toContainEqual(["/"]);
    expect(chamadas).toContainEqual(["/edicoes-anteriores"]);
    for (const padrao of Object.values(PADROES_PORTAL)) {
      expect(chamadas).toContainEqual([padrao, "page"]);
    }
  });

  it("portal inteiro: layout do grupo (portal)", () => {
    vi.mocked(revalidatePath).mockClear();
    revalidarPortalInteiro();
    expect(revalidatePath).toHaveBeenCalledWith("/(portal)", "layout");
  });

  it("categorias: tag do menu + portal inteiro", async () => {
    vi.mocked(revalidatePath).mockClear();
    await revalidarCategorias();
    expect(updateTag).toHaveBeenCalledWith(TAG_CATEGORIAS);
    expect(revalidatePath).toHaveBeenCalledWith("/(portal)", "layout");
  });
});

describe("invalidação por matéria", () => {
  it("com slugs, invalida só as páginas dessas matérias (e todas as listagens)", () => {
    vi.mocked(revalidatePath).mockClear();
    revalidarMateriasNoPortal(["nova-materia", "slug-antigo", null, "nova-materia"]);
    const chamadas = vi.mocked(revalidatePath).mock.calls;
    expect(chamadas).toContainEqual(["/noticia/nova-materia"]);
    expect(chamadas).toContainEqual(["/noticia/slug-antigo"]);
    expect(chamadas.filter(([caminho]) => caminho === "/noticia/nova-materia")).toHaveLength(1);
    expect(chamadas).not.toContainEqual([PADROES_PORTAL.noticia, "page"]);
    for (const pagina of ["categoria", "regiao", "tag", "politico", "revista"] as const) {
      expect(chamadas).toContainEqual([PADROES_PORTAL[pagina], "page"]);
    }
  });
});
