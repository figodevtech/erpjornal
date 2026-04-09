"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function redirecionarComErro(mensagem: string) {
  redirect(`/erp/permissoes?erro=${encodeURIComponent(mensagem)}`);
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
        redirecionarComErro("Informe o nome do novo perfil.");
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
  } catch (error: any) {
    let mensagem =
      error instanceof Error ? error.message : "Nao foi possivel salvar as permissoes.";

    if (error?.code === "P2002") {
      mensagem = "Ja existe um perfil com esse nome.";
    }

    redirecionarComErro(mensagem);
  }

  revalidatePath("/erp/permissoes");
  revalidatePath("/erp/usuarios");
  redirect("/erp/permissoes?sucesso=permissoes-salvas");
}
