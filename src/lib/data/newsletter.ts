import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { inteiroLimitado } from "@/lib/http/parametros";
import { isStatusInscricao, type StatusInscricao } from "@/lib/newsletter/regras";
import { prisma } from "@/lib/prisma";

export const INSCRITOS_POR_PAGINA = 50;
export const LIMITE_EXPORTACAO_INSCRITOS = 50_000;

export type FiltrosInscritos = { status?: StatusInscricao; busca?: string; pagina: number };

type Parametros = Record<string, string | string[] | undefined> | URLSearchParams;

function ler(parametros: Parametros, nome: string) {
  const valor = parametros instanceof URLSearchParams ? parametros.get(nome) : parametros[nome];
  return (Array.isArray(valor) ? valor[0] : valor)?.trim() || undefined;
}

export function lerFiltrosInscritos(parametros: Parametros): FiltrosInscritos {
  const status = ler(parametros, "status");
  return {
    status: isStatusInscricao(status) ? status : undefined,
    busca: ler(parametros, "busca")?.slice(0, 120),
    pagina: inteiroLimitado(ler(parametros, "pagina"), { padrao: 1, min: 1, max: 10_000 }),
  };
}

export function whereInscritos(filtros: FiltrosInscritos): Prisma.InscricaoNewsletterWhereInput {
  return {
    ...(filtros.status && { status: filtros.status }),
    ...(filtros.busca && { email: { contains: filtros.busca, mode: "insensitive" as const } }),
  };
}

export async function contarInscritosPorStatus() {
  const grupos = await prisma.inscricaoNewsletter.groupBy({ by: ["status"], _count: { _all: true } });
  const contagem: Record<string, number> = {};
  for (const grupo of grupos) contagem[grupo.status] = grupo._count._all;
  return contagem;
}

const CAMPOS_INSCRITO = {
  id: true,
  email: true,
  status: true,
  origem: true,
  criadoEm: true,
  confirmadoEm: true,
  descadastradoEm: true,
} satisfies Prisma.InscricaoNewsletterSelect;

export async function listarInscritos(filtros: FiltrosInscritos) {
  const where = whereInscritos(filtros);
  const [inscritos, total] = await Promise.all([
    prisma.inscricaoNewsletter.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip: (filtros.pagina - 1) * INSCRITOS_POR_PAGINA,
      take: INSCRITOS_POR_PAGINA,
      select: CAMPOS_INSCRITO,
    }),
    prisma.inscricaoNewsletter.count({ where }),
  ]);
  return { inscritos, total, totalPaginas: Math.max(1, Math.ceil(total / INSCRITOS_POR_PAGINA)) };
}

export async function listarInscritosParaExportacao(filtros: FiltrosInscritos) {
  return prisma.inscricaoNewsletter.findMany({
    where: whereInscritos(filtros),
    orderBy: { criadoEm: "asc" },
    take: LIMITE_EXPORTACAO_INSCRITOS,
    select: CAMPOS_INSCRITO,
  });
}

export async function listarDisparosRecentes() {
  return prisma.envioNewsletter.findMany({
    orderBy: { iniciadoEm: "desc" },
    take: 15,
    select: {
      id: true,
      status: true,
      destinatarios: true,
      enviados: true,
      erro: true,
      iniciadoEm: true,
      concluidoEm: true,
      artigo: { select: { titulo: true, slug: true } },
    },
  });
}
