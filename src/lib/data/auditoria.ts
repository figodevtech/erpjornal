import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { isEntidadeAuditada, type EntidadeAuditada } from "@/lib/auditoria-formato";
import { inteiroLimitado } from "@/lib/http/parametros";
import { prisma } from "@/lib/prisma";

export const AUDITORIA_POR_PAGINA = 50;
/** Teto da exportação CSV (os mais recentes que casam com os filtros). */
export const AUDITORIA_LIMITE_EXPORTACAO = 10_000;

export type FiltrosAuditoria = {
  entidade?: EntidadeAuditada;
  acao?: string;
  usuarioId?: string;
  registroId?: string;
  /** Datas no formato AAAA-MM-DD (fuso de Brasília). */
  de?: string;
  ate?: string;
  pagina: number;
};

type ParametrosBrutos = Record<string, string | string[] | undefined> | URLSearchParams;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATA = /^\d{4}-\d{2}-\d{2}$/;
const ACAO = /^[A-Z_]{1,40}$/;

function ler(parametros: ParametrosBrutos, nome: string): string | undefined {
  const valor = parametros instanceof URLSearchParams ? parametros.get(nome) : parametros[nome];
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return texto?.trim() || undefined;
}

/** Lê os filtros da URL descartando valores inválidos (nunca lança erro). */
export function lerFiltrosAuditoria(parametros: ParametrosBrutos): FiltrosAuditoria {
  const entidade = ler(parametros, "entidade");
  const acao = ler(parametros, "acao");
  const usuarioId = ler(parametros, "usuario");
  const registroId = ler(parametros, "registro");
  const de = ler(parametros, "de");
  const ate = ler(parametros, "ate");

  return {
    entidade: isEntidadeAuditada(entidade) ? entidade : undefined,
    acao: acao && ACAO.test(acao) ? acao : undefined,
    usuarioId: usuarioId && UUID.test(usuarioId) ? usuarioId : undefined,
    registroId: registroId && UUID.test(registroId) ? registroId : undefined,
    de: de && DATA.test(de) ? de : undefined,
    ate: ate && DATA.test(ate) ? ate : undefined,
    pagina: inteiroLimitado(ler(parametros, "pagina"), { padrao: 1, min: 1, max: 10_000 }),
  };
}

/** Os filtros de volta para a query string (paginação e link de exportação). */
export function filtrosParaQuery(filtros: FiltrosAuditoria, pagina?: number) {
  const params = new URLSearchParams();
  if (filtros.entidade) params.set("entidade", filtros.entidade);
  if (filtros.acao) params.set("acao", filtros.acao);
  if (filtros.usuarioId) params.set("usuario", filtros.usuarioId);
  if (filtros.registroId) params.set("registro", filtros.registroId);
  if (filtros.de) params.set("de", filtros.de);
  if (filtros.ate) params.set("ate", filtros.ate);
  if (pagina && pagina > 1) params.set("pagina", String(pagina));
  return params.toString();
}

/** Converte AAAA-MM-DD para o instante correspondente em Brasília (UTC-3, sem horário de verão). */
function dataBrasilia(data: string, fimDoDia: boolean) {
  const instante = new Date(`${data}T${fimDoDia ? "23:59:59.999" : "00:00:00.000"}-03:00`);
  return Number.isNaN(instante.getTime()) ? undefined : instante;
}

export function whereAuditoria(filtros: FiltrosAuditoria): Prisma.LogAuditoriaWhereInput {
  const where: Prisma.LogAuditoriaWhereInput = {};
  if (filtros.entidade) where.entidade = filtros.entidade;
  if (filtros.acao) where.acao = filtros.acao;
  if (filtros.usuarioId) where.usuarioId = filtros.usuarioId;
  if (filtros.registroId) where.entidadeId = filtros.registroId;

  const de = filtros.de ? dataBrasilia(filtros.de, false) : undefined;
  const ate = filtros.ate ? dataBrasilia(filtros.ate, true) : undefined;
  if (de || ate) where.criadoEm = { ...(de && { gte: de }), ...(ate && { lte: ate }) };

  return where;
}

const CAMPOS_LOG = {
  id: true,
  acao: true,
  entidade: true,
  entidadeId: true,
  dadoAnterior: true,
  dadoNovo: true,
  ip: true,
  userAgent: true,
  criadoEm: true,
  usuario: { select: { id: true, nome: true, email: true } },
} satisfies Prisma.LogAuditoriaSelect;

export async function listarAuditoria(filtros: FiltrosAuditoria) {
  const where = whereAuditoria(filtros);
  const [registros, total] = await Promise.all([
    prisma.logAuditoria.findMany({
      where,
      orderBy: { criadoEm: "desc" },
      skip: (filtros.pagina - 1) * AUDITORIA_POR_PAGINA,
      take: AUDITORIA_POR_PAGINA,
      select: CAMPOS_LOG,
    }),
    prisma.logAuditoria.count({ where }),
  ]);
  return { registros, total, totalPaginas: Math.max(1, Math.ceil(total / AUDITORIA_POR_PAGINA)) };
}

export async function listarAuditoriaParaExportacao(filtros: FiltrosAuditoria) {
  return prisma.logAuditoria.findMany({
    where: whereAuditoria(filtros),
    orderBy: { criadoEm: "desc" },
    take: AUDITORIA_LIMITE_EXPORTACAO,
    select: CAMPOS_LOG,
  });
}

/** Usuários que já aparecem na trilha (para o filtro por pessoa). */
export async function listarAutoresDaAuditoria() {
  return prisma.usuario.findMany({
    where: { logsAuditoria: { some: {} } },
    select: { id: true, nome: true, email: true },
    orderBy: { nome: "asc" },
  });
}
