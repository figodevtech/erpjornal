import "server-only";

import { revalidatePath, updateTag } from "next/cache";

import { redis, redisKeys } from "@/lib/redis";

/**
 * Padrões de rota das páginas do portal para `revalidatePath`.
 *
 * As páginas ficam no route group "(portal)", e as tags de cache do Next usam o
 * caminho do ARQUIVO: `revalidatePath("/noticia/[slug]", "page")` não invalida
 * nada; o certo é "/(portal)/noticia/[slug]". (Caminhos literais, como "/" ou
 * "/revistas/123", funcionam sem o grupo.)
 */
export const PADROES_PORTAL = {
  noticia: "/(portal)/noticia/[slug]",
  categoria: "/(portal)/categoria/[slug]",
  regiao: "/(portal)/regiao/[slug]",
  tag: "/(portal)/tag/[slug]",
  politico: "/(portal)/politico/[slug]",
  revista: "/(portal)/revistas/[id]",
} as const;

export type PaginaPortal = keyof typeof PADROES_PORTAL;

/** Tag do cache do menu de categorias (src/lib/data/categories.ts). */
export const TAG_CATEGORIAS = "categorias";

/** Invalida todas as URLs dos tipos de página informados. */
export function revalidarPaginasPortal(...paginas: PaginaPortal[]) {
  for (const pagina of paginas) revalidatePath(PADROES_PORTAL[pagina], "page");
}

/**
 * Matérias mudaram (publicação, edição, exclusão): home, listas e páginas que as mostram.
 *
 * Com `slugs`, invalida só as páginas dessas matérias (uma página de notícia não
 * mostra as outras); sem, invalida todas as notícias. As listagens (categoria,
 * tag, região...) são sempre invalidadas.
 */
export function revalidarMateriasNoPortal(slugs?: readonly (string | null | undefined)[]) {
  revalidatePath("/");
  revalidatePath("/edicoes-anteriores");
  revalidarPaginasPortal("categoria", "regiao", "tag", "politico", "revista");

  const unicos = new Set((slugs ?? []).filter((slug): slug is string => Boolean(slug)));
  if (slugs === undefined) {
    revalidarPaginasPortal("noticia");
  } else {
    for (const slug of unicos) revalidatePath(`/noticia/${slug}`);
  }
}

/** Mudança visível em todas as páginas do portal (anúncios, menu de categorias). */
export function revalidarPortalInteiro() {
  revalidatePath("/(portal)", "layout");
}

/** Categorias mudaram: menu do cabeçalho (cache próprio + Redis) e todas as páginas. */
export async function revalidarCategorias() {
  updateTag(TAG_CATEGORIAS);
  try {
    await redis.del(redisKeys.categoryCache("all"));
  } catch (erro) {
    console.error("Redis: não consegui limpar o cache de categorias:", erro);
  }
  revalidarPortalInteiro();
}
