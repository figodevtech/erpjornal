import { describe, expect, it } from "vitest";

import { sanitizarHtmlArtigo } from "../sanitize";

// Procura atributos de evento reais (` onerror=`), não o texto "onerror" escapado
// dentro do valor de outro atributo (ex.: src="x/onerror=&quot;...&quot;", inofensivo).
const contemExecutavel = (html: string) =>
  /<script|\son\w+\s*=|javascript:|<iframe|<svg|<object|<embed|srcdoc|style=/i.test(html);

describe("sanitizarHtmlArtigo — payloads que passavam pelo filtro antigo (regex)", () => {
  const payloads = [
    `<img src=x onerror=alert(1)>`,
    `<img src="x" onerror="alert(1)">`,
    `<img/src=x/onerror="alert(1)">`,
    `<a href="javascript:alert(1)">clique</a>`,
    `<a href="JaVaScRiPt:alert(1)">clique</a>`,
    `<a href=" javascript:alert(1)">clique</a>`,
    `<iframe srcdoc="<script>alert(1)</script>"></iframe>`,
    `<svg><animate onbegin=alert(1) attributeName=x></svg>`,
    `<scr<script></script>ipt>alert(1)</script>`,
    `<p style="background:url(javascript:alert(1))">x</p>`,
    `<object data="javascript:alert(1)"></object>`,
    `<embed src="javascript:alert(1)">`,
    `<math><mtext><table><mglyph><style><img src=x onerror=alert(1)>`,
  ];

  for (const payload of payloads) {
    it(`neutraliza: ${payload}`, () => {
      expect(contemExecutavel(sanitizarHtmlArtigo(payload))).toBe(false);
    });
  }
});

describe("sanitizarHtmlArtigo — conteúdo editorial legítimo", () => {
  it("preserva a formatação do editor", () => {
    const html =
      "<h2>Título</h2><p>Texto <strong>forte</strong>, <em>itálico</em>, <u>sublinhado</u> e <s>riscado</s>.</p>" +
      "<ul><li>um</li></ul><ol><li>dois</li></ol><blockquote><p>citação</p></blockquote><hr>";
    expect(sanitizarHtmlArtigo(html)).toBe(html.replace("<hr>", "<hr />"));
  });

  it("mantém links http(s) e força rel seguro em target=_blank", () => {
    expect(sanitizarHtmlArtigo('<a href="https://gov.br" target="_blank">gov</a>')).toBe(
      '<a href="https://gov.br" target="_blank" rel="noopener noreferrer">gov</a>'
    );
  });

  it("mantém imagens com tamanho/alinhamento válidos e descarta valores inválidos", () => {
    expect(sanitizarHtmlArtigo('<img src="https://x.com/a.jpg" alt="a" data-size="large" data-align="left">')).toBe(
      '<img src="https://x.com/a.jpg" alt="a" data-size="large" data-align="left" />'
    );
    expect(sanitizarHtmlArtigo('<img src="https://x.com/a.jpg" data-size="enorme" data-align="x">')).toBe(
      '<img src="https://x.com/a.jpg" />'
    );
  });

  it("remove classes e estilos (a aparência vem do CSS do portal)", () => {
    expect(sanitizarHtmlArtigo('<p class="fixed inset-0" style="color:red">x</p>')).toBe("<p>x</p>");
  });

  it("descarta o conteúdo de script/style, não só a tag", () => {
    expect(sanitizarHtmlArtigo("<p>a</p><script>roubar()</script><style>body{}</style>")).toBe("<p>a</p>");
  });

  it("lida com vazio e nulo", () => {
    expect(sanitizarHtmlArtigo("")).toBe("");
    expect(sanitizarHtmlArtigo(null)).toBe("");
  });
});
