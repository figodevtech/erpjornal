"use server";

import { revalidatePath } from "next/cache";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isPrismaError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

export async function salvarPermissoesPerfil(formData: FormData) {
  await exigirPermissao("usuarios:gerir");

  const perfilId = formData.get("perfilId")?.toString() ?? "";
  const nome = formData.get("nome")?.toString().trim() ?? "";
  const descricao = formData.get("descricao")?.toString().trim() || null;
  const permissaoIds = Array.from(
    new Set(
      formData
        .getAll("permissoes")
        .map((value) => value.toString())
        .filter(Boolean)
    )
  );

  try {
    let perfilAlvoId = perfilId;

    if (perfilId) {
      await prisma.perfil.update({
        where: { id: perfilId },
        data: { descricao },
      });
    } else {
      if (!nome) {
        throw new Error("Informe o nome do novo perfil.");
      }

      const novoPerfil = await prisma.perfil.create({
        data: {
          nome,
          descricao,
        },
      });

      perfilAlvoId = novoPerfil.id;
    }

    await prisma.perfilPermissao.deleteMany({
      where: { perfilId: perfilAlvoId },
    });

    if (permissaoIds.length) {
      await prisma.perfilPermissao.createMany({
        data: permissaoIds.map((permissaoId) => ({
          perfilId: perfilAlvoId,
          permissaoId,
        })),
        skipDuplicates: true,
      });
    }
  } catch (error: unknown) {
    let mensagem =
      error instanceof Error ? error.message : "Não foi possível salvar as permissões.";

    if (isPrismaError(error) && error.code === "P2002") {
      mensagem = "Já existe um perfil com esse nome.";
    }

    throw new Error(mensagem);
  }

  revalidatePath("/erp/permissoes");
  revalidatePath("/erp/usuarios");
  return { ok: true };
}
