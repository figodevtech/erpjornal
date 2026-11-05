import type { StatusArtigo } from "@prisma/client";

export type { StatusArtigo };

/**
 * Valores do enum `StatusArtigo` do banco.
 *
 * Seguro para client components (só o tipo vem do Prisma). O `satisfies`
 * faz o typecheck falhar se o enum do schema mudar e este objeto não.
 */
export const STATUS_ARTIGO = {
  pauta: "pauta",
  apuracao: "apuracao",
  redacao: "redacao",
  revisao: "revisao",
  juridico: "juridico",
  publicado: "publicado",
  arquivado: "arquivado",
} as const satisfies { [K in StatusArtigo]: K };

type InfoStatus = {
  label: string;
  /** Cor da borda da coluna no Kanban. */
  borda: string;
  /** Classes do selo (badge) nas listagens. */
  badge: string;
};

export const STATUS_INFO: Record<StatusArtigo, InfoStatus> = {
  pauta: { label: "Pauta", borda: "border-gray-200", badge: "bg-gray-100 text-gray-800" },
  apuracao: { label: "Apuração", borda: "border-blue-200", badge: "bg-blue-100 text-blue-800" },
  redacao: { label: "Redação", borda: "border-yellow-200", badge: "bg-yellow-100 text-yellow-800" },
  revisao: { label: "Revisão", borda: "border-orange-200", badge: "bg-orange-100 text-orange-800" },
  juridico: { label: "Jurídico", borda: "border-red-200", badge: "bg-red-100 text-red-800" },
  publicado: { label: "Publicado", borda: "border-green-200", badge: "bg-emerald-100 text-emerald-800" },
  arquivado: { label: "Arquivado", borda: "border-slate-200", badge: "bg-slate-200 text-slate-700" },
};

/** As 6 etapas do fluxo editorial, na ordem do Kanban (arquivado fica de fora). */
export const ETAPAS_FLUXO: readonly StatusArtigo[] = [
  "pauta",
  "apuracao",
  "redacao",
  "revisao",
  "juridico",
  "publicado",
];

/** Status que exigem a permissão `artigos:publicar` para entrar ou sair. */
export const STATUS_RESTRITOS: readonly StatusArtigo[] = ["publicado", "arquivado"];

export function isStatusArtigo(valor: unknown): valor is StatusArtigo {
  return typeof valor === "string" && valor in STATUS_ARTIGO;
}

/**
 * Status que o usuário pode escolher no formulário.
 * Sem `artigos:publicar`, só as etapas anteriores à publicação.
 */
export function statusPermitidos(podePublicar: boolean): StatusArtigo[] {
  return podePublicar
    ? [...ETAPAS_FLUXO, "arquivado"]
    : ETAPAS_FLUXO.filter((status) => !STATUS_RESTRITOS.includes(status));
}

/**
 * Decide o status final ao salvar um artigo.
 *
 * - Valor inválido vira `pauta` (artigo novo) ou mantém o status atual.
 * - Sem `artigos:publicar`: pedir publicação manda para `revisao`, e um
 *   artigo publicado/arquivado não muda de status.
 */
export function resolverStatusAoSalvar(params: {
  solicitado: unknown;
  atual: StatusArtigo | null;
  podePublicar: boolean;
}): StatusArtigo {
  const { solicitado, atual, podePublicar } = params;
  const base: StatusArtigo = isStatusArtigo(solicitado) ? solicitado : atual ?? "pauta";

  if (podePublicar) return base;
  if (atual && STATUS_RESTRITOS.includes(atual)) return atual;
  if (STATUS_RESTRITOS.includes(base)) return "revisao";
  return base;
}
