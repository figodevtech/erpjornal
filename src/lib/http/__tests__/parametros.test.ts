import { describe, expect, it } from "vitest";

import { inteiroLimitado, isSlugValido } from "../parametros";

describe("inteiroLimitado", () => {
  const faixa = { padrao: 10, min: 1, max: 50 };

  it("corta valores acima do máximo (ex.: ?limit=100000 despejava a base)", () => {
    expect(inteiroLimitado("100000", faixa)).toBe(50);
  });

  it("corta valores abaixo do mínimo", () => {
    expect(inteiroLimitado("0", faixa)).toBe(1);
    expect(inteiroLimitado("-5", faixa)).toBe(1);
  });

  it("usa o padrão para ausente ou inválido (antes virava NaN e quebrava a query)", () => {
    expect(inteiroLimitado(null, faixa)).toBe(10);
    expect(inteiroLimitado("abc", faixa)).toBe(10);
    expect(inteiroLimitado("", faixa)).toBe(10);
  });

  it("mantém valores válidos", () => {
    expect(inteiroLimitado("25", faixa)).toBe(25);
  });
});

describe("isSlugValido", () => {
  it("aceita slugs do portal", () => {
    expect(isSlugValido("gestao-publica")).toBe(true);
    expect(isSlugValido("revista-edicao-2-ia")).toBe(true);
  });

  it("rejeita valores fora do formato", () => {
    expect(isSlugValido("Gestão")).toBe(false);
    expect(isSlugValido("a b")).toBe(false);
    expect(isSlugValido("../etc")).toBe(false);
    expect(isSlugValido("-inicio")).toBe(false);
    expect(isSlugValido("x".repeat(121))).toBe(false);
    expect(isSlugValido(null)).toBe(false);
  });
});
