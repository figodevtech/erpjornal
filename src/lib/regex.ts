/**
 * Escapa um texto para usar literalmente dentro de uma RegExp.
 * Sem isso, uma busca por ")" ou "+" lança SyntaxError e derruba a página.
 */
export function escaparRegex(texto: string) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
