/**
 * Utilitários puros sobre o HTML (já sanitizado) das matérias.
 * Seguros para servidor e navegador.
 */

const PARAGRAFO = /<p\b[^>]*>[\s\S]*?<\/p>/gi;

/** Divide o corpo ao meio (por parágrafos) para inserir o anúncio do meio do texto. */
export function dividirParaAnuncio(html: string) {
  const blocos = html.match(PARAGRAFO);

  if (!blocos || blocos.length < 4) {
    return { antes: html, depois: "" };
  }

  const meio = Math.max(2, Math.ceil(blocos.length / 2));
  const inicioPrimeiro = html.indexOf(blocos[0]);
  const ultimo = blocos[blocos.length - 1];
  const fimUltimo = html.lastIndexOf(ultimo) + ultimo.length;

  return {
    antes: `${html.slice(0, inicioPrimeiro)}${blocos.slice(0, meio).join("")}`,
    depois: `${blocos.slice(meio).join("")}${html.slice(fimUltimo)}`,
  };
}

/** Primeiros parágrafos do corpo, para o teaser de matérias exclusivas. */
export function trechoInicial(html: string, paragrafos = 2) {
  const blocos = html.match(PARAGRAFO);
  return blocos?.length ? blocos.slice(0, paragrafos).join("") : "";
}
