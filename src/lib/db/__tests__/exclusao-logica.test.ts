import { describe, expect, it } from "vitest";

import { aplicarExclusaoLogica, motivoOperacaoProibida } from "@/lib/db/exclusao-logica";

describe("motivoOperacaoProibida", () => {
  it("recusa exclusão física nos models com soft-delete", () => {
    expect(motivoOperacaoProibida("Artigo", "delete")).toMatch(/exclusão lógica/);
    expect(motivoOperacaoProibida("Revista", "deleteMany")).toMatch(/exclusão lógica/);
  });

  it("libera as demais operações e os demais models", () => {
    expect(motivoOperacaoProibida("Artigo", "update")).toBeNull();
    expect(motivoOperacaoProibida("Artigo", "findMany")).toBeNull();
    expect(motivoOperacaoProibida("InscricaoNewsletter", "delete")).toBeNull();
    expect(motivoOperacaoProibida("ArtigoTag", "deleteMany")).toBeNull();
    expect(motivoOperacaoProibida(undefined, "delete")).toBeNull();
  });
});

describe("aplicarExclusaoLogica", () => {
  it("esconde excluídos nas leituras dos models com soft-delete", () => {
    expect(aplicarExclusaoLogica("Artigo", "findMany", { where: { status: "publicado" } })).toEqual({
      where: { status: "publicado", excluidoEm: null },
    });
    expect(aplicarExclusaoLogica("Revista", "count", undefined)).toEqual({ where: { excluidoEm: null } });
    expect(aplicarExclusaoLogica("Categoria", "findUnique", { where: { slug: "x" } })).toEqual({
      where: { slug: "x", excluidoEm: null },
    });
  });

  it("respeita excluidoEm explícito (inclusive undefined, para trazer todos)", () => {
    const todos = { where: { slug: "x", excluidoEm: undefined } };
    expect(aplicarExclusaoLogica("Artigo", "findFirst", todos)).toBe(todos);
    const soExcluidos = { where: { excluidoEm: { not: null } } };
    expect(aplicarExclusaoLogica("Artigo", "findMany", soExcluidos)).toBe(soExcluidos);
  });

  it("não mexe em escrita nem em models sem soft-delete", () => {
    const update = { where: { id: "1" }, data: { titulo: "x" } };
    expect(aplicarExclusaoLogica("Artigo", "update", update)).toBe(update);
    const leitura = { where: { id: "1" } };
    expect(aplicarExclusaoLogica("Usuario", "findMany", leitura)).toBe(leitura);
    expect(aplicarExclusaoLogica(undefined, "findMany", leitura)).toBe(leitura);
  });

  it("não altera o objeto recebido", () => {
    const where = { status: "pauta" };
    const args = { where };
    aplicarExclusaoLogica("Artigo", "findMany", args);
    expect(args.where).toBe(where);
    expect(where).toEqual({ status: "pauta" });
  });
});
