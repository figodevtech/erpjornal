import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { filtrosParaQuery, lerFiltrosAuditoria, whereAuditoria } from "@/lib/data/auditoria";

const UUID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

describe("lerFiltrosAuditoria", () => {
  it("aceita filtros válidos", () => {
    const filtros = lerFiltrosAuditoria({
      entidade: "artigo",
      acao: "EXCLUSAO",
      usuario: UUID,
      registro: UUID,
      de: "2026-11-01",
      ate: "2026-11-05",
      pagina: "3",
    });
    expect(filtros).toEqual({
      entidade: "artigo",
      acao: "EXCLUSAO",
      usuarioId: UUID,
      registroId: UUID,
      de: "2026-11-01",
      ate: "2026-11-05",
      pagina: 3,
    });
  });

  it("descarta valores inválidos sem lançar erro", () => {
    const filtros = lerFiltrosAuditoria(
      new URLSearchParams({
        entidade: "toString",
        acao: "drop table",
        usuario: "1 OR 1=1",
        de: "ontem",
        pagina: "-5",
      })
    );
    expect(filtros).toEqual({ pagina: 1 });
  });
});

describe("whereAuditoria", () => {
  it("converte as datas para o dia inteiro em Brasília", () => {
    const where = whereAuditoria({ de: "2026-11-01", ate: "2026-11-05", pagina: 1 });
    expect(where.criadoEm).toEqual({
      gte: new Date("2026-11-01T03:00:00.000Z"),
      lte: new Date("2026-11-06T02:59:59.999Z"),
    });
  });

  it("sem filtros, não restringe nada", () => {
    expect(whereAuditoria({ pagina: 1 })).toEqual({});
  });

  it("monta a query de volta (paginação e exportação)", () => {
    expect(filtrosParaQuery({ entidade: "revista", acao: "EDICAO", pagina: 1 }, 2)).toBe(
      "entidade=revista&acao=EDICAO&pagina=2"
    );
    expect(filtrosParaQuery({ pagina: 4 })).toBe("");
  });
});
