"use server";

import { revalidatePath } from "next/cache";
import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "@/lib/auditoria";
import { slugify } from "@/lib/slug";
import { revalidarCategorias } from "@/lib/cache/portal";

function isPrismaError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

export async function salvarCategoria(formData: FormData) {
  const id = (formData.get("id") as string | null) || null;
  const sessao = await exigirPermissao(id ? "categorias:editar" : "categorias:criar");

  const nome = (formData.get("nome") as string)?.trim();
  const slugInput = (formData.get("slug") as string)?.trim();
  const esfera = ((formData.get("esfera") as string) || "").trim() || null;
  const cor = ((formData.get("cor") as string) || "").trim() || null;
  const metaDescricao = ((formData.get("metaDescricao") as string) || "").trim() || null;

  if (!nome) {
    throw new Error("Informe o nome da categoria.");
  }

  const slug = slugify(slugInput || nome);
  if (!slug) {
    throw new Error("Não foi possível gerar um slug válido.");
  }

  // Regra do PRD: categorias de política interna exigem checagem de fatos para publicar.
  const exigeChecagem = formData.get("exigeChecagem") === "on" || formData.get("exigeChecagem") === "true";

  const data = { nome, slug, esfera, cor, metaDescricao, exigeChecagem };

  try {
    const antes = id ? await prisma.categoria.findUnique({ where: { id } }) : null;
    const salva = id
      ? await prisma.categoria.update({ where: { id }, data })
      : await prisma.categoria.create({ data });
    await registrarAuditoria({ usuarioId: sessao.user.id, acao: id ? "EDICAO" : "CRIACAO", entidade: "categoria", entidadeId: salva.id, antes, depois: data });
  } catch (error: unknown) {
    if (isPrismaError(error) && error.code === "P2002") {
      throw new Error("Ja existe uma categoria com esse nome ou slug.");
    }
    throw error;
  }

  revalidatePath("/erp/categorias");
  revalidatePath("/erp/artigos/novo");
  revalidatePath("/erp/artigos/[id]/edit", "page");
  await revalidarCategorias();
}

export async function excluirCategoria(id: string) {
  const sessao = await exigirPermissao("categorias:editar");

  const categoria = await prisma.categoria.findUnique({
    where: { id },
    include: {
      _count: { select: { artigos: { where: { excluidoEm: null } }, subcategorias: { where: { excluidoEm: null } } } },
    },
  });

  if (!categoria) {
    throw new Error("Categoria não encontrada.");
  }

  if (categoria._count.artigos > 0 || categoria._count.subcategorias > 0) {
    throw new Error("Não é possível excluir uma categoria que possui artigos ou subcategorias.");
  }

  // Exclusão lógica (PRD: nada é apagado fisicamente).
  await prisma.$transaction(async (tx) => {
    const anterior = await tx.categoria.update({ where: { id }, data: { excluidoEm: new Date() } });
    await registrarAuditoria({ usuarioId: sessao.user.id, acao: "EXCLUSAO", entidade: "categoria", entidadeId: id, antes: anterior }, tx);
  });

  revalidatePath("/erp/categorias");
  revalidatePath("/erp/artigos/novo");
  revalidatePath("/erp/artigos/[id]/edit", "page");
  await revalidarCategorias();
}
