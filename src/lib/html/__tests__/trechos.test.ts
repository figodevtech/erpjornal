import { describe, expect, it } from "vitest";

import { dividirParaAnuncio, trechoInicial } from "../trechos";

const corpo = (n: number) => Array.from({ length: n }, (_, i) => `<p>P${i + 1}</p>`).join("");

describe("dividirParaAnuncio", () => {
  it("divide ao meio quando há pelo menos 4 parágrafos", () => {
    expect(dividirParaAnuncio(corpo(6))).toEqual({ antes: corpo(3), depois: "<p>P4</p><p>P5</p><p>P6</p>" });
  });

  it("não divide textos curtos", () => {
    expect(dividirParaAnuncio(corpo(3))).toEqual({ antes: corpo(3), depois: "" });
  });

  it("preserva o que vem antes e depois dos parágrafos", () => {
    const html = `<h2>Título</h2>${corpo(4)}<hr />`;
    const { antes, depois } = dividirParaAnuncio(html);
    expect(antes.startsWith("<h2>Título</h2>")).toBe(true);
    expect(depois.endsWith("<hr />")).toBe(true);
  });
});

describe("trechoInicial", () => {
  it("devolve os primeiros parágrafos", () => {
    expect(trechoInicial(corpo(5))).toBe("<p>P1</p><p>P2</p>");
  });

  it("devolve vazio sem parágrafos", () => {
    expect(trechoInicial("<h2>só título</h2>")).toBe("");
  });
});
