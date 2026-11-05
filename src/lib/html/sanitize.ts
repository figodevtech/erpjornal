import "server-only";

import sanitizeHtml from "sanitize-html";

/**
 * Sanitização do HTML de matérias (allowlist).
 *
 * É a barreira contra XSS para todo HTML que vira corpo de artigo: editor do
 * ERP, saída da IA e conteúdo de feeds RSS de terceiros. Aplicar ao GRAVAR e,
 * de forma defensiva, ao RENDERIZAR no portal.
 */

const TAMANHOS_IMAGEM = new Set(["small", "medium", "large", "full"]);
const ALINHAMENTOS_IMAGEM = new Set(["left", "center", "right"]);

const OPCOES: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "h1", "h2", "h3", "h4",
    "strong", "b", "em", "i", "u", "s", "code", "pre",
    "a", "ul", "ol", "li", "blockquote",
    "img", "figure", "figcaption",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "data-size", "data-align"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  allowedSchemesAppliedToAttributes: ["href", "src"],
  allowProtocolRelative: false,
  // Conteúdo de tags perigosas é descartado junto com a tag.
  nonTextTags: ["script", "style", "textarea", "option", "noscript", "iframe", "object", "embed", "svg", "math"],
  transformTags: {
    a: (tagName, attribs) => {
      const atributos = { ...attribs };
      if (atributos.target && atributos.target !== "_blank") delete atributos.target;
      if (atributos.target === "_blank") atributos.rel = "noopener noreferrer";
      return { tagName, attribs: atributos };
    },
    img: (tagName, attribs) => {
      const atributos = { ...attribs };
      if (atributos["data-size"] && !TAMANHOS_IMAGEM.has(atributos["data-size"])) delete atributos["data-size"];
      if (atributos["data-align"] && !ALINHAMENTOS_IMAGEM.has(atributos["data-align"])) delete atributos["data-align"];
      return { tagName, attribs: atributos };
    },
  },
};

export function sanitizarHtmlArtigo(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPCOES).trim();
}
