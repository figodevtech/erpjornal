import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { criarClienteSupabaseServer } from "@/lib/supabase/server";

const mapaPerfisLegados: Record<string, string> = {
  admin_erp: "admin",
  editor_erp: "editor",
  reporter_erp: "reporter",
  juridico_erp: "juridico",
  leitor_portal: "assinante",
  autor_portal: "autor_portal",
};

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
  };
};

export const obterSessao = cache(async (): Promise<SessaoAplicacao | null> => {
  const supabase = await criarClienteSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

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

  return {
    user: {
      id: usuario.id,
      name: usuario.nome ?? user.user_metadata?.nome ?? user.email ?? null,
      email: usuario.email ?? user.email ?? null,
      role: normalizarRole(perfis),
      perfis,
      permissoes,
      tipoConta: usuario.tipoConta,
      status: usuario.status,
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

export function temPerfil(sessao: SessaoAplicacao, perfisAceitos: string[]) {
  return sessao.user.perfis.some(
    (perfil) => perfisAceitos.includes(perfil) || perfisAceitos.includes(mapaPerfisLegados[perfil] ?? "")
  );
}

export function temPermissao(sessao: SessaoAplicacao, permissao: string) {
  return (
    sessao.user.role === "admin" ||
    sessao.user.perfis.includes("admin_erp") ||
    sessao.user.permissoes.includes(permissao)
  );
}

export function temAlgumaPermissao(sessao: SessaoAplicacao, permissoes: string[]) {
  return permissoes.some((permissao) => temPermissao(sessao, permissao));
}

export function podeAcessarErp(sessao: SessaoAplicacao) {
  return (
    sessao.user.tipoConta === "erp" ||
    sessao.user.tipoConta === "misto" ||
    temPerfil(sessao, ["admin_erp", "editor_erp", "reporter_erp", "juridico_erp", "admin", "editor", "reporter", "juridico"])
  );
}

export async function exigirAcessoErp() {
  const sessao = await exigirSessao();

  if (!podeAcessarErp(sessao)) {
    redirect("/403");
  }

  return sessao;
}

export async function exigirPerfis(perfisAceitos: string[]) {
  const sessao = await exigirAcessoErp();

  if (!temPerfil(sessao, perfisAceitos)) {
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
