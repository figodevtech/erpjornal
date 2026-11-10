/**
 * Regras de sigilo das fontes (puras e testáveis).
 *
 * - Fonte confidencial só é vista, editada ou anotada com `fontes:confidencial`.
 * - Nível desconhecido conta como confidencial (falha fechada).
 * - O nome de uma fonte confidencial é o dado mais sensível: não vai para a auditoria.
 */
import { temPermissao, type SessaoComPermissoes } from "@/lib/rbac";

export const NIVEIS_SIGILO = ["publico", "reservado", "confidencial"] as const;
export type NivelSigilo = (typeof NIVEIS_SIGILO)[number];

/** Níveis visíveis para quem não tem `fontes:confidencial`. */
export const NIVEIS_SEM_RESTRICAO: readonly NivelSigilo[] = ["publico", "reservado"];

/** Normaliza o nível gravado no banco: valor desconhecido vira "confidencial". */
export function nivelSigiloSeguro(valor: string | null | undefined): NivelSigilo {
  return (NIVEIS_SIGILO as readonly string[]).includes(valor ?? "") ? (valor as NivelSigilo) : "confidencial";
}

export function podeAcessarFonte(sessao: SessaoComPermissoes, fonte: { nivelSigilo: string | null }) {
  return nivelSigiloSeguro(fonte.nivelSigilo) !== "confidencial" || temPermissao(sessao, "fontes:confidencial");
}

/** Mensagem de bloqueio para editar/anotar a fonte, ou null se permitido. */
export function motivoBloqueioFonte(sessao: SessaoComPermissoes, fonte: { nivelSigilo: string | null }) {
  return podeAcessarFonte(sessao, fonte) ? null : "Esta fonte é confidencial: você não tem acesso a ela.";
}

/** O que a auditoria registra da fonte: o nome só quando ela não é confidencial. */
export function resumoFonteParaAuditoria(fonte: { nome: string; nivelSigilo: string | null }) {
  const nivelSigilo = nivelSigiloSeguro(fonte.nivelSigilo);
  return nivelSigilo === "confidencial" ? { nivelSigilo } : { nome: fonte.nome, nivelSigilo };
}
