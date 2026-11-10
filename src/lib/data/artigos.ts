import "server-only";

import { cache } from "react";

import { STATUS_ARTIGO } from "@/lib/editorial/status";
import { prisma } from "@/lib/prisma";

/**
 * Filtro de "matéria visível no portal": publicada e com data de publicação
 * já alcançada (matérias agendadas ficam ocultas até a hora marcada).
 */
export function filtroArtigoNoAr(agora = new Date()) {
  return {
    status: STATUS_ARTIGO.publicado,
    dataPublicacao: { lte: agora },
  };
}

/** Máximo de matérias nas listagens do portal (categoria, região): a página não cresce com o acervo. */
export const LIMITE_MATERIAS_LISTAGEM = 60;

/**
 * Busca uma matéria visível no portal pelo slug.
 * Deduplicada por requisição (React cache): metadata e página compartilham a consulta.
 */
export const buscarArtigoPublicado = cache(async (slug: string) => {
  return prisma.artigo.findFirst({
    where: { slug, ...filtroArtigoNoAr() },
    include: {
      autor: true,
      categoria: true,
      itemRss: {
        include: {
          source: true,
        },
      },
      checagensFato: {
        select: { id: true, urlFonte: true, urlDocumento: true, statusVerificacao: true },
        orderBy: { criadoEm: "asc" },
      },
      tags: {
        select: { tag: { select: { nome: true, slug: true } } },
        orderBy: { tag: { nome: "asc" } },
      },
      // Só entidades com perfil público (com slug e não excluídas).
      artigosPoliticos: {
        where: { politico: { excluidoEm: null, slug: { not: null } } },
        select: { papel: true, politico: { select: { nome: true, slug: true, cargo: true, partido: true } } },
      },
    },
  });
});

/** Campos de matéria usados nas listagens do portal (cards). */
export const CAMPOS_CARD_MATERIA = {
  id: true,
  titulo: true,
  slug: true,
  resumo: true,
  urlImagemOg: true,
  dataPublicacao: true,
  criadoEm: true,
  autor: { select: { nome: true } },
  categoria: { select: { nome: true } },
} as const;

/** Tag com ao menos uma matéria no ar (tag só de rascunhos não aparece no portal). */
export const buscarTagPublica = cache(async (slug: string) => {
  return prisma.tag.findFirst({
    where: { slug, artigos: { some: { artigo: { ...filtroArtigoNoAr(), excluidoEm: null } } } },
    select: { id: true, nome: true, slug: true },
  });
});

/** Perfil público de uma entidade/político (sem CPF/CNPJ). */
export const buscarPoliticoPublico = cache(async (slug: string) => {
  return prisma.politico.findFirst({
    where: { slug },
    select: {
      id: true,
      nome: true,
      slug: true,
      cargo: true,
      partido: true,
      biografia: true,
      urlFoto: true,
      regiao: true,
      estado: true,
      categoriaEntidade: true,
    },
  });
});

/**
 * Slug antigo de uma matéria publicada (o slug mudou depois da publicação):
 * devolve o slug atual para a página responder 301.
 */
export const buscarSlugAtual = cache(async (slugAntigo: string) => {
  const redirecionamento = await prisma.redirecionamentoSlug.findUnique({
    where: { slugAntigo },
    select: { artigoId: true },
  });
  if (!redirecionamento) return null;

  const artigo = await prisma.artigo.findFirst({
    where: { id: redirecionamento.artigoId, ...filtroArtigoNoAr() },
    select: { slug: true },
  });
  return artigo && artigo.slug !== slugAntigo ? artigo.slug : null;
});
