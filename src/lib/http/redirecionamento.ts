/**
 * Valida um destino de redirecionamento vindo da URL (ex.: ?callbackUrl=).
 * Só aceita caminhos internos: "/erp", "/noticia/x?y=1". Recusa URLs externas,
 * inclusive as relativas ao protocolo ("//site.com") e variações com barra
 * invertida ("/\\site.com"), que o navegador trata como outro domínio.
 */
export function destinoInternoSeguro(destino: string | null | undefined): string | null {
  if (!destino || !destino.startsWith("/")) return null;
  if (destino.startsWith("//") || destino.startsWith("/\\")) return null;
  if (/[\u0000-\u001f]/.test(destino)) return null;
  return destino;
}
