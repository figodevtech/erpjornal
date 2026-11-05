import { describe, expect, it } from "vitest";

import {
  ETAPAS_FLUXO,
  STATUS_INFO,
  isStatusArtigo,
  resolverStatusAoSalvar,
  statusPermitidos,
} from "../status";

describe("fluxo editorial", () => {
  it("tem as 6 etapas do Kanban, na ordem, sem arquivado", () => {
    expect(ETAPAS_FLUXO).toEqual(["pauta", "apuracao", "redacao", "revisao", "juridico", "publicado"]);
  });

  it("tem rótulo para todo status", () => {
    for (const status of [...ETAPAS_FLUXO, "arquivado" as const]) {
      expect(STATUS_INFO[status].label).toBeTruthy();
    }
  });

  it("reconhece só valores do enum", () => {
    expect(isStatusArtigo("revisao")).toBe(true);
    expect(isStatusArtigo("rascunho")).toBe(false);
    expect(isStatusArtigo("em_revisao")).toBe(false);
    expect(isStatusArtigo("toString")).toBe(false);
    expect(isStatusArtigo(undefined)).toBe(false);
  });
});

describe("statusPermitidos", () => {
  it("sem permissão de publicar, oferece só as etapas antes da publicação", () => {
    expect(statusPermitidos(false)).toEqual(["pauta", "apuracao", "redacao", "revisao", "juridico"]);
  });

  it("com permissão de publicar, oferece todas as etapas e arquivado", () => {
    expect(statusPermitidos(true)).toEqual([...ETAPAS_FLUXO, "arquivado"]);
  });
});

describe("resolverStatusAoSalvar", () => {
  it("artigo novo sem status válido começa em pauta", () => {
    expect(resolverStatusAoSalvar({ solicitado: "rascunho", atual: null, podePublicar: false })).toBe("pauta");
    expect(resolverStatusAoSalvar({ solicitado: null, atual: null, podePublicar: true })).toBe("pauta");
  });

  it("status inválido em artigo existente mantém o status atual", () => {
    expect(resolverStatusAoSalvar({ solicitado: "xyz", atual: "redacao", podePublicar: false })).toBe("redacao");
  });

  it("sem permissão, pedir publicação manda para revisão", () => {
    expect(resolverStatusAoSalvar({ solicitado: "publicado", atual: "redacao", podePublicar: false })).toBe("revisao");
    expect(resolverStatusAoSalvar({ solicitado: "arquivado", atual: "pauta", podePublicar: false })).toBe("revisao");
  });

  it("sem permissão, artigo publicado ou arquivado não muda de status", () => {
    expect(resolverStatusAoSalvar({ solicitado: "pauta", atual: "publicado", podePublicar: false })).toBe("publicado");
    expect(resolverStatusAoSalvar({ solicitado: "revisao", atual: "arquivado", podePublicar: false })).toBe("arquivado");
  });

  it("sem permissão, move livremente entre as etapas anteriores", () => {
    expect(resolverStatusAoSalvar({ solicitado: "juridico", atual: "revisao", podePublicar: false })).toBe("juridico");
  });

  it("com permissão, aceita publicar, despublicar e arquivar", () => {
    expect(resolverStatusAoSalvar({ solicitado: "publicado", atual: "revisao", podePublicar: true })).toBe("publicado");
    expect(resolverStatusAoSalvar({ solicitado: "revisao", atual: "publicado", podePublicar: true })).toBe("revisao");
    expect(resolverStatusAoSalvar({ solicitado: "arquivado", atual: "publicado", podePublicar: true })).toBe("arquivado");
  });
});
