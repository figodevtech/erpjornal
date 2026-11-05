/**
 * Regras de autorização sobre artigos (puras e testáveis).
 *
 * - Editar: autor com `artigos:editar`/`artigos:publicar`, ou qualquer um com `artigos:editar_todos`.
 * - Entrar ou sair de "publicado"/"arquivado" (publicar, despublicar, arquivar): `artigos:publicar`.
 * - Trocar o autor de um artigo: `artigos:editar_todos` (ação de editor).
 * - Excluir: quem pode editar; artigo publicado exige também `artigos:publicar`.
 *
 * As funções `motivo*` devolvem a mensagem de bloqueio, ou null se permitido.
 */
import { temAlgumaPermissao, temPermissao, type SessaoComPermissoes } from "@/lib/rbac";

import { STATUS_RESTRITOS, type StatusArtigo } from "./status";

export type ArtigoParaPermissao = {
  autorId: string;
  status: StatusArtigo;
};

export function podeEditarArtigo(sessao: SessaoComPermissoes, artigo: ArtigoParaPermissao) {
  if (temPermissao(sessao, "artigos:editar_todos")) return true;
  return (
    artigo.autorId === sessao.user.id &&
    temAlgumaPermissao(sessao, ["artigos:editar", "artigos:publicar"])
  );
}

export function motivoBloqueioMudancaStatus(
  sessao: SessaoComPermissoes,
  artigo: ArtigoParaPermissao,
  novoStatus: StatusArtigo
): string | null {
  if (!podeEditarArtigo(sessao, artigo)) {
    return "Você não tem permissão para alterar este artigo.";
  }
  const envolveRestrito = STATUS_RESTRITOS.includes(artigo.status) || STATUS_RESTRITOS.includes(novoStatus);
  if (envolveRestrito && !temPermissao(sessao, "artigos:publicar")) {
    return "Somente quem pode publicar pode publicar, despublicar ou arquivar artigos.";
  }
  return null;
}

export function podeAtribuirAutor(sessao: SessaoComPermissoes) {
  return temPermissao(sessao, "artigos:editar_todos");
}

export function motivoBloqueioExclusao(
  sessao: SessaoComPermissoes,
  artigo: ArtigoParaPermissao
): string | null {
  if (!podeEditarArtigo(sessao, artigo)) {
    return "Você não tem permissão para excluir este artigo.";
  }
  if (artigo.status === "publicado" && !temPermissao(sessao, "artigos:publicar")) {
    return "Somente quem pode publicar pode excluir um artigo publicado.";
  }
  return null;
}
