import { describe, expect, it } from "vitest";

import { extractPlainTextFromHtml, splitTextIntoChunks } from "../tts-utils";

describe("extractPlainTextFromHtml", () => {
  const html = `
    <h1>Título da Matéria</h1>
    <p>Este é o <strong>primeiro</strong> parágrafo de notícia.</p>
    <p>O segundo parágrafo vem agora.&nbsp;Onde temos espaços inquebráveis.</p>
    <h2>Subtítulo Relevante</h2>
    <p>Frase final aqui.</p>
  `;

  it("remove tags e pontua títulos para a leitura em voz", () => {
    const texto = extractPlainTextFromHtml(html);
    expect(texto).toContain("Título da Matéria.\n\nEste é o primeiro parágrafo de notícia.");
    expect(texto).not.toContain("<strong>");
  });

  it("decodifica entidades comuns", () => {
    expect(extractPlainTextFromHtml(html)).toContain("agora. Onde temos");
  });

  it("não lê o conteúdo de scripts e estilos", () => {
    expect(extractPlainTextFromHtml("<p>Oi</p><script>alerta()</script><style>p{}</style>")).toBe("Oi");
  });

  it("devolve vazio para entrada vazia", () => {
    expect(extractPlainTextFromHtml("")).toBe("");
  });
});

describe("splitTextIntoChunks", () => {
  it("quebra textos longos em blocos menores", () => {
    const texto =
      "Esta é uma frase curta. Esta frase é propositalmente mais longa para testar a capacidade de quebra de blocos em sentenças menores para que a API de síntese de voz nativa não congele no Webview do celular.";
    const blocos = splitTextIntoChunks(texto, 50);
    expect(blocos.length).toBeGreaterThan(1);
    for (const bloco of blocos) expect(bloco.length).toBeLessThanOrEqual(60);
  });
});
