import { describe, expect, it } from "vitest";

import { calcularExpiracao, destinoDoPlantao, excedentesDoLimite, rotuloPrazo } from "@/lib/plantao";

describe("excedentesDoLimite", () => {
  it("encerra os mais antigos além do limite", () => {
    const ativos = Array.from({ length: 12 }, (_, i) => ({ id: `p${i}` }));
    expect(excedentesDoLimite(ativos, 10)).toEqual(["p10", "p11"]);
    expect(excedentesDoLimite(ativos.slice(0, 10), 10)).toEqual([]);
  });
});

describe("calcularExpiracao", () => {
  it("soma as horas; zero = sem prazo", () => {
    const agora = new Date("2026-11-05T12:00:00Z");
    expect(calcularExpiracao(3, agora)).toEqual(new Date("2026-11-05T15:00:00Z"));
    expect(calcularExpiracao(0, agora)).toBeNull();
  });

  it("rótulos legíveis", () => {
    expect(rotuloPrazo(0)).toBe("Até encerrar");
    expect(rotuloPrazo(1)).toBe("1 hora");
    expect(rotuloPrazo(6)).toBe("6 horas");
  });
});

describe("destinoDoPlantao", () => {
  it("prefere a matéria quando ela está no ar", () => {
    expect(destinoDoPlantao({ link: "https://x.gov.br", artigo: { slug: "materia", noAr: true } })).toBe(
      "/noticia/materia"
    );
  });

  it("matéria fora do ar não vira link; cai no link externo, se houver", () => {
    expect(destinoDoPlantao({ link: null, artigo: { slug: "rascunho", noAr: false } })).toBeNull();
    expect(destinoDoPlantao({ link: "https://x.gov.br", artigo: { slug: "rascunho", noAr: false } })).toBe(
      "https://x.gov.br"
    );
  });

  it("só aceita link externo https", () => {
    expect(destinoDoPlantao({ link: "javascript:alert(1)", artigo: null })).toBeNull();
    expect(destinoDoPlantao({ link: "http://inseguro.com", artigo: null })).toBeNull();
  });
});
