export const AD_PAGE_TYPES = [
  { value: "home", label: "Home" },
  { value: "noticia", label: "Artigos comuns" },
  { value: "revista", label: "Revistas" },
  { value: "categoria", label: "Categorias" },
] as const;

export const AD_POSITIONS = [
  { value: "topo", label: "Topo" },
  { value: "meio", label: "Meio da pagina" },
  { value: "feed", label: "Entre chamadas" },
  { value: "lateral", label: "Lateral" },
  { value: "apos_imagem", label: "Depois da imagem" },
] as const;

export const AD_SIZES = [
  { value: "banner_horizontal", label: "Banner horizontal", ratio: "aspect-[6/1]" },
  { value: "banner_largo", label: "Banner largo", ratio: "aspect-[970/250]" },
  { value: "quadrado", label: "Quadrado", ratio: "aspect-square" },
  { value: "vertical", label: "Vertical", ratio: "aspect-[3/5]" },
] as const;

export const AD_PLACEMENTS = [
  {
    value: "topo_banner",
    label: "Topo da pagina",
    description: "Banner largo para abrir a home, categoria, revista ou artigo.",
    tamanho: "banner_largo",
    posicoes: ["topo"],
  },
  {
    value: "conteudo_banner",
    label: "Entre textos",
    description: "Banner horizontal para entrar no corpo do artigo ou em secoes de conteudo.",
    tamanho: "banner_horizontal",
    posicoes: ["meio"],
  },
  {
    value: "apos_imagem_banner",
    label: "Depois da imagem",
    description: "Banner horizontal logo abaixo da imagem principal do artigo.",
    tamanho: "banner_horizontal",
    posicoes: ["apos_imagem"],
  },
  {
    value: "feed_banner",
    label: "Entre chamadas",
    description: "Banner horizontal para listas de chamadas e para o fim do corpo do artigo.",
    tamanho: "banner_horizontal",
    posicoes: ["feed"],
  },
  {
    value: "lateral_quadrado",
    label: "Lateral quadrado",
    description: "Formato quadrado exclusivo para a coluna lateral.",
    tamanho: "quadrado",
    posicoes: ["lateral"],
  },
  {
    value: "lateral_vertical",
    label: "Lateral vertical",
    description: "Banner vertical exclusivo para a coluna lateral.",
    tamanho: "vertical",
    posicoes: ["lateral"],
  },
] as const;

export type AdPageType = (typeof AD_PAGE_TYPES)[number]["value"];
export type AdPosition = (typeof AD_POSITIONS)[number]["value"];
export type AdSize = (typeof AD_SIZES)[number]["value"];
export type AdPlacement = (typeof AD_PLACEMENTS)[number]["value"];

export function getAdSize(value: string) {
  return AD_SIZES.find((size) => size.value === value) ?? AD_SIZES[0];
}

export function getAdPlacement(value: string) {
  return AD_PLACEMENTS.find((placement) => placement.value === value) ?? AD_PLACEMENTS[0];
}

export function inferAdPlacement(tamanho: string, posicoes: string[]) {
  return (
    AD_PLACEMENTS.find(
      (placement) =>
        placement.tamanho === tamanho &&
        placement.posicoes.length === posicoes.length &&
        placement.posicoes.every((posicao) => posicoes.includes(posicao))
    ) ?? AD_PLACEMENTS[0]
  );
}
