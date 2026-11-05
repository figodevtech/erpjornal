import { describe, expect, it } from "vitest";

import {
  camposAlterados,
  celulaCsv,
  isEntidadeAuditada,
  limparParaLog,
  linhaCsv,
  rotuloAcao,
} from "@/lib/auditoria-formato";

describe("limparParaLog", () => {
  it("remove credenciais em qualquer nível", () => {
    const limpo = limparParaLog({
      email: "a@b.com",
      senha: "123456",
      perfil: { apiKey: "sk-xyz", nome: "Editor", refresh_token: "t" },
      SUPABASE_SECRET: "s",
    });
    expect(limpo).toEqual({
      email: "a@b.com",
      senha: "[removido]",
      perfil: { apiKey: "[removido]", nome: "Editor", refresh_token: "[removido]" },
      SUPABASE_SECRET: "[removido]",
    });
    expect(JSON.stringify(limpo)).not.toContain("123456");
  });

  it("converte datas para ISO e ignora vazio", () => {
    expect(limparParaLog({ em: new Date("2026-01-02T03:04:05Z") })).toEqual({ em: "2026-01-02T03:04:05.000Z" });
    expect(limparParaLog(undefined)).toBeUndefined();
    expect(limparParaLog(null)).toBeUndefined();
  });

  it("embrulha valores primitivos (a coluna é JSON de objeto)", () => {
    expect(limparParaLog(true)).toEqual({ valor: true });
  });
});

describe("camposAlterados", () => {
  it("lista só os campos que mudaram", () => {
    expect(
      camposAlterados(
        { titulo: "A", status: "pauta", slug: "a" },
        { titulo: "B", status: "pauta", slug: "a", novo: 1 }
      )
    ).toEqual(["titulo"]);
  });

  it("compara valores aninhados pelo conteúdo", () => {
    expect(camposAlterados({ canais: ["portal"] }, { canais: ["portal"] })).toEqual([]);
    expect(camposAlterados({ canais: ["portal"] }, { canais: ["portal", "newsletter"] })).toEqual(["canais"]);
  });

  it("sem antes ou depois, não há diff", () => {
    expect(camposAlterados(null, { titulo: "x" })).toEqual([]);
    expect(camposAlterados({ titulo: "x" }, undefined)).toEqual([]);
  });
});

describe("CSV", () => {
  it("neutraliza fórmulas (injeção de CSV)", () => {
    expect(celulaCsv("=HYPERLINK(\"http://x\")")).toBe("\"'=HYPERLINK(\"\"http://x\"\")\"");
    expect(celulaCsv("+1")).toBe("'+1");
    expect(celulaCsv("-1")).toBe("'-1");
    expect(celulaCsv("@SOMA")).toBe("'@SOMA");
  });

  it("coloca aspas quando há separador, aspas ou quebra de linha", () => {
    expect(celulaCsv("a;b")).toBe('"a;b"');
    expect(celulaCsv('diz "oi"')).toBe('"diz ""oi"""');
    expect(celulaCsv("linha1\nlinha2")).toBe('"linha1\nlinha2"');
    expect(celulaCsv("simples")).toBe("simples");
  });

  it("serializa nulos, datas e objetos", () => {
    expect(celulaCsv(null)).toBe("");
    expect(celulaCsv(undefined)).toBe("");
    expect(celulaCsv(new Date("2026-11-05T12:00:00Z"))).toBe("2026-11-05T12:00:00.000Z");
    expect(celulaCsv({ titulo: "x" })).toBe('"{""titulo"":""x""}"');
  });

  it("monta a linha com ponto e vírgula", () => {
    expect(linhaCsv(["a", 1, null, "b;c"])).toBe('a;1;;"b;c"');
  });
});

describe("rótulos", () => {
  it("traduz ações conhecidas e mantém as desconhecidas", () => {
    expect(rotuloAcao("EXCLUSAO")).toBe("Exclusão");
    expect(rotuloAcao("ALGO_NOVO")).toBe("ALGO_NOVO");
  });

  it("reconhece só entidades válidas", () => {
    expect(isEntidadeAuditada("artigo")).toBe(true);
    expect(isEntidadeAuditada("toString")).toBe(false);
    expect(isEntidadeAuditada(undefined)).toBe(false);
  });
});
