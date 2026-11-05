/**
 * Regras de permissão puras (sem banco nem Next): usadas por src/lib/auth.ts
 * e pelas regras de domínio, e fáceis de testar.
 */

/** Forma mínima de sessão necessária para checar permissões. */
export type SessaoComPermissoes = {
  user: { id: string; permissoes: string[] };
};

export function isPermissaoErp(permissao: string) {
  return !permissao.startsWith("portal:");
}

export function temPermissao(sessao: SessaoComPermissoes, permissao: string) {
  return sessao.user.permissoes.includes(permissao);
}

export function temAlgumaPermissao(sessao: SessaoComPermissoes, permissoes: string[]) {
  return permissoes.some((permissao) => temPermissao(sessao, permissao));
}

export function podeAcessarErp(sessao: SessaoComPermissoes) {
  return sessao.user.permissoes.some(isPermissaoErp);
}
