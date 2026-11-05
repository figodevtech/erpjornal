/**
 * Exclusão lógica (soft-delete): regra pura usada pela extensão do Prisma em
 * src/lib/prisma.ts. Separada para ser testável sem banco.
 */

export const MODELOS_COM_EXCLUSAO_LOGICA: ReadonlySet<string> = new Set([
  "Artigo",
  "Revista",
  "Categoria",
  "Politico",
  "Anuncio",
  "FonteRss",
  "MediaKit",
]);

const OPERACOES_DE_LEITURA: ReadonlySet<string> = new Set([
  "findMany",
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
]);

/**
 * Devolve os argumentos da consulta com `excluidoEm: null` no where quando o
 * model tem soft-delete e a operação é de leitura. Se o where já menciona
 * `excluidoEm` (inclusive `undefined`, para trazer tudo), nada muda.
 * Não altera o objeto recebido.
 */
export function aplicarExclusaoLogica<T>(model: string | undefined, operacao: string, args: T): T {
  if (!model || !MODELOS_COM_EXCLUSAO_LOGICA.has(model) || !OPERACOES_DE_LEITURA.has(operacao)) {
    return args;
  }
  const consulta = (args ?? {}) as { where?: Record<string, unknown> };
  if (consulta.where && "excluidoEm" in consulta.where) {
    return args;
  }
  return { ...consulta, where: { ...consulta.where, excluidoEm: null } } as T;
}
