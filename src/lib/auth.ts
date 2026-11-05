import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { avaliarMfa, lerNivelDoToken, type EstadoMfa } from "@/lib/mfa";
import { isPermissaoErp, podeAcessarErp, temAlgumaPermissao, temPermissao } from "@/lib/rbac";
import { criarClienteSupabaseServer } from "@/lib/supabase/server";

// Regras puras de permissão vivem em src/lib/rbac.ts; reexportadas por compatibilidade.
export { isPermissaoErp, podeAcessarErp, temAlgumaPermissao, temPermissao } from "@/lib/rbac";

function normalizarRole(perfis: string[]) {
  if (perfis.includes("admin_erp")) return "admin";
  if (perfis.includes("editor_erp")) return "editor";
  if (perfis.includes("juridico_erp")) return "juridico";
  if (perfis.includes("reporter_erp")) return "reporter";
  if (perfis.includes("autor_portal")) return "autor_portal";
  return "assinante";
}

export type SessaoAplicacao = {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    perfis: string[];
    permissoes: string[];
    tipoConta: string;
    status: string;
    /** Segundo fator (TOTP). Com `pendente`, as permissões do ERP ficam de fora até confirmar o código. */
    mfa: EstadoMfa;
  };
};

/** Caminho da tela de cadastro/confirmação do segundo fator (fora do layout do ERP). */
export const CAMINHO_MFA = "/seguranca/mfa";

export const obterSessao = cache(async (): Promise<SessaoAplicacao | null> => {
  const supabase = await criarClienteSupabaseServer();
  // O token da sessão é validado pelo Auth (getUser); o nível de MFA (claim aal)
  // é lido desse mesmo token, nunca de um cookie não verificado.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) {
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser(token);

  if (!user) {
    return null;
  }

  const nivel = lerNivelDoToken(token);
  const fatoresVerificados = (user.factors ?? []).filter((fator) => fator.status === "verified").length;

  const usuario = await prisma.usuario.findUnique({
    where: { id: user.id },
    include: {
      perfis: {
        include: {
          perfil: {
            include: {
              permissoes: {
                include: {
                  permissao: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!usuario) {
    return {
      user: {
        id: user.id,
        name: user.user_metadata?.nome ?? user.email ?? null,
        email: user.email ?? null,
        role: "assinante",
        perfis: [],
        permissoes: [],
        tipoConta: "portal",
        status: "ativo",
        mfa: avaliarMfa({ perfis: [], temPermissaoErp: false, fatoresVerificados, nivel }),
      },
    };
  }

  const perfis = usuario.perfis.map(({ perfil }) => perfil.nome);
  const permissoes = Array.from(
    new Set(
      usuario.perfis.flatMap(({ perfil }) =>
        perfil.permissoes.map(
          ({ permissao }) => `${permissao.modulo}:${permissao.acao}`
        )
      )
    )
  );

  const mfa = avaliarMfa({
    perfis,
    temPermissaoErp: permissoes.some(isPermissaoErp),
    fatoresVerificados,
    nivel,
  });

  return {
    user: {
      id: usuario.id,
      name: usuario.nome ?? user.user_metadata?.nome ?? user.email ?? null,
      email: usuario.email ?? user.email ?? null,
      role: normalizarRole(perfis),
      perfis,
      // Sem o segundo fator confirmado, nenhuma checagem de permissão do ERP passa.
      permissoes: mfa.pendente ? permissoes.filter((permissao) => !isPermissaoErp(permissao)) : permissoes,
      tipoConta: usuario.tipoConta,
      status: usuario.status,
      mfa,
    },
  };
});

export async function exigirSessao() {
  const sessao = await obterSessao();

  if (!sessao?.user || sessao.user.status !== "ativo") {
    redirect("/login");
  }

  return sessao;
}

export async function exigirAcessoErp() {
  const sessao = await exigirSessao();

  if (sessao.user.mfa.pendente) {
    redirect(CAMINHO_MFA);
  }

  if (!podeAcessarErp(sessao)) {
    redirect("/403");
  }

  return sessao;
}

export async function exigirPermissao(permissao: string) {
  const sessao = await exigirAcessoErp();

  if (!temPermissao(sessao, permissao)) {
    redirect("/403");
  }

  return sessao;
}

export async function exigirAlgumaPermissao(permissoes: string[]) {
  const sessao = await exigirAcessoErp();

  if (!temAlgumaPermissao(sessao, permissoes)) {
    redirect("/403");
  }

  return sessao;
}
