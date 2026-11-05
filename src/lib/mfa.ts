/**
 * Regras puras da autenticação em dois fatores (TOTP via Supabase Auth).
 *
 * - Admin e editor precisam de MFA para usar o ERP (MFA_OBRIGATORIO=false
 *   desliga só essa obrigatoriedade).
 * - Quem já cadastrou um autenticador sempre precisa dele para entrar no ERP.
 * - Sessão sem o segundo fator (nível aal1) perde as permissões do ERP até
 *   confirmar o código; as do portal continuam valendo.
 */

export const PERFIS_COM_MFA_OBRIGATORIO: readonly string[] = ["admin_erp", "editor_erp"];

/** Nível de garantia da sessão no Supabase: aal1 = só senha, aal2 = senha + segundo fator. */
export type NivelAutenticacao = "aal1" | "aal2" | null;

export type EstadoMfa = {
  /** O ERP exige o segundo fator desta pessoa. */
  exigido: boolean;
  /** Já existe autenticador confirmado. */
  configurado: boolean;
  /** Exigido e ainda não confirmado nesta sessão: o ERP fica bloqueado. */
  pendente: boolean;
  nivel: NivelAutenticacao;
};

export function mfaObrigatorioAtivo(valor: string | undefined = process.env.MFA_OBRIGATORIO) {
  return valor?.trim().toLowerCase() !== "false";
}

/** Lê o nível (claim `aal`) de um access token do Supabase já validado pelo Auth. */
export function lerNivelDoToken(token: string): NivelAutenticacao {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { aal?: unknown };
    return json.aal === "aal1" || json.aal === "aal2" ? json.aal : null;
  } catch {
    return null;
  }
}

export function avaliarMfa({
  perfis,
  temPermissaoErp,
  fatoresVerificados,
  nivel,
  obrigatorio = mfaObrigatorioAtivo(),
}: {
  perfis: readonly string[];
  temPermissaoErp: boolean;
  fatoresVerificados: number;
  nivel: NivelAutenticacao;
  obrigatorio?: boolean;
}): EstadoMfa {
  const configurado = fatoresVerificados > 0;
  const perfilExige = obrigatorio && perfis.some((perfil) => PERFIS_COM_MFA_OBRIGATORIO.includes(perfil));
  const exigido = temPermissaoErp && (configurado || perfilExige);
  return { exigido, configurado, pendente: exigido && nivel !== "aal2", nivel };
}
