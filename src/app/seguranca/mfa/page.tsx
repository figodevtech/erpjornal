import type { Metadata } from "next";

import { exigirSessao } from "@/lib/auth";
import { destinoInternoSeguro } from "@/lib/http/redirecionamento";
import { isPermissaoErp } from "@/lib/rbac";
import { criarClienteSupabaseServer } from "@/lib/supabase/server";

import GerenciadorMfa from "./GerenciadorMfa";

export const metadata: Metadata = {
  title: "Autenticação em dois fatores | Revista Gestão",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}

/**
 * Cadastro e confirmação do segundo fator (TOTP). Fica fora de /erp: o layout
 * do ERP manda para cá quem ainda não confirmou o código, e aqui dentro ele
 * redirecionaria para si mesmo.
 */
export default async function MfaPage({ searchParams }: PageProps) {
  const sessao = await exigirSessao();
  const { callbackUrl } = await searchParams;

  const supabase = await criarClienteSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fatoresTotp = (user?.factors ?? []).filter((fator) => fator.factor_type === "totp");

  const usaErp = sessao.user.mfa.exigido || sessao.user.permissoes.some(isPermissaoErp);
  const destino =
    destinoInternoSeguro(typeof callbackUrl === "string" ? callbackUrl : null) ?? (usaErp ? "/erp" : "/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 py-12">
      <GerenciadorMfa
        email={sessao.user.email}
        estado={sessao.user.mfa}
        destino={destino}
        fatoresVerificados={fatoresTotp
          .filter((fator) => fator.status === "verified")
          .map((fator) => ({ id: fator.id, nome: fator.friendly_name || "Autenticador", criadoEm: fator.created_at }))}
        fatoresNaoConfirmados={fatoresTotp.filter((fator) => fator.status !== "verified").map((fator) => fator.id)}
      />
    </div>
  );
}
