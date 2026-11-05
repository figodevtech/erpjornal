"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "@/lib/auditoria";

type Resultado = { ok: true } | { ok: false; error: string };

const PERFIL_ADMIN = "admin_erp";
const PERMISSAO_GESTAO = { modulo: "usuarios", acao: "gerir" } as const;

const DadosPerfil = z.object({
  perfilId: z.union([z.uuid(), z.literal("")]),
  nome: z.string().trim().max(60).regex(/^[a-z0-9_]*$/, "Use apenas letras minúsculas, números e _ no nome do perfil."),
  descricao: z.string().trim().max(200),
  permissoes: z.array(z.uuid()).max(200),
});

function isPrismaError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

export async function salvarPermissoesPerfil(formData: FormData): Promise<Resultado> {
  const sessao = await exigirPermissao("usuarios:gerir");

  const dados = DadosPerfil.safeParse({
    perfilId: formData.get("perfilId")?.toString() ?? "",
    nome: formData.get("nome")?.toString() ?? "",
    descricao: formData.get("descricao")?.toString() ?? "",
    permissoes: Array.from(new Set(formData.getAll("permissoes").map(String).filter(Boolean))),
  });
  if (!dados.success) {
    return { ok: false, error: dados.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { perfilId, nome, descricao, permissoes } = dados.data;

  const totalValidas = await prisma.permissao.count({ where: { id: { in: permissoes } } });
  if (totalValidas !== permissoes.length) {
    return { ok: false, error: "Uma ou mais permissões selecionadas não existem." };
  }

  if (perfilId) {
    const perfil = await prisma.perfil.findUnique({ where: { id: perfilId }, select: { nome: true } });
    if (!perfil) return { ok: false, error: "Perfil não encontrado." };

    // Tirar usuarios:gerir do admin_erp trancaria todos os admins fora da gestão de acessos.
    if (perfil.nome === PERFIL_ADMIN) {
      const gestao = await prisma.permissao.findUnique({
        where: { modulo_acao: PERMISSAO_GESTAO },
        select: { id: true },
      });
      if (gestao && !permissoes.includes(gestao.id)) {
        return { ok: false, error: `O perfil ${PERFIL_ADMIN} precisa manter a permissão usuarios:gerir.` };
      }
    }
  } else if (!nome) {
    return { ok: false, error: "Informe o nome do novo perfil." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const alvoId = perfilId
        ? (await tx.perfil.update({ where: { id: perfilId }, data: { descricao: descricao || null } })).id
        : (await tx.perfil.create({ data: { nome, descricao: descricao || null } })).id;

      // Trocar o conjunto de permissões numa transação: nunca fica um perfil "sem nada" no meio.
      await tx.perfilPermissao.deleteMany({ where: { perfilId: alvoId } });
      if (permissoes.length) {
        await tx.perfilPermissao.createMany({
          data: permissoes.map((permissaoId) => ({ perfilId: alvoId, permissaoId })),
          skipDuplicates: true,
        });
      }
    });
  } catch (error: unknown) {
    if (isPrismaError(error) && error.code === "P2002") {
      return { ok: false, error: "Já existe um perfil com esse nome." };
    }
    console.error("Erro ao salvar permissões:", error);
    return { ok: false, error: "Não foi possível salvar as permissões." };
  }

  await registrarAuditoria({
    usuarioId: sessao.user.id,
    acao: perfilId ? "EDICAO" : "CRIACAO",
    entidade: "perfil",
    entidadeId: perfilId || null,
    depois: { nome: nome || undefined, descricao, permissoes },
  });

  revalidatePath("/erp/permissoes");
  revalidatePath("/erp/usuarios");
  return { ok: true };
}
