"use server";

import { revalidatePath } from "next/cache";
import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function salvarCategoria(formData: FormData) {
  await exigirPermissao("categorias:gerir");

  const id = (formData.get("id") as string | null) || null;
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
    throw new Error("Nao foi possivel gerar um slug valido.");
  }

  const data = { nome, slug, esfera, cor, metaDescricao };

  try {
    if (id) {
      await prisma.categoria.update({ where: { id }, data });
    } else {
      await prisma.categoria.create({ data });
    }
  } catch (error: any) {
    if (error?.code === "P2002") {
      throw new Error("Ja existe uma categoria com esse nome ou slug.");
    }
    throw error;
  }

  revalidatePath("/erp/categorias");
  revalidatePath("/erp/artigos/novo");
  revalidatePath("/erp/artigos/[id]/edit", "page");
  revalidatePath("/categoria/[slug]", "page");
}

export async function excluirCategoria(id: string) {
  await exigirPermissao("categorias:gerir");

  const categoria = await prisma.categoria.findUnique({
    where: { id },
    include: { _count: { select: { artigos: true, subcategorias: true } } },
  });

  if (!categoria) {
    throw new Error("Categoria nao encontrada.");
  }

  if (categoria._count.artigos > 0 || categoria._count.subcategorias > 0) {
    throw new Error("Nao e possivel excluir uma categoria que possui artigos ou subcategorias.");
  }

  await prisma.categoria.delete({ where: { id } });

  revalidatePath("/erp/categorias");
  revalidatePath("/erp/artigos/novo");
  revalidatePath("/erp/artigos/[id]/edit", "page");
}
