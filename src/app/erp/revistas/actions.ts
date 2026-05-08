"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function saveRevista(formData: FormData) {
  const id = formData.get("id") as string | null;
  await (id ? exigirPermissao("revistas:editar") : exigirPermissao("revistas:criar"));

  const titulo = (formData.get("titulo") as string)?.trim();
  const descricao = ((formData.get("descricao") as string) || "").trim() || null;
  const edicao = (formData.get("edicao") as string)?.trim();
  const dataPublicacaoRaw = formData.get("dataPublicacao") as string;
  const capaUrl = ((formData.get("capaUrl") as string) || "").trim() || null;

  if (!titulo || !edicao) {
    throw new Error("Título e edição são obrigatórios.");
  }

  const dataPublicacao = dataPublicacaoRaw ? new Date(dataPublicacaoRaw) : null;
  const data = {
    titulo,
    descricao,
    edicao,
    dataPublicacao: dataPublicacao && !Number.isNaN(dataPublicacao.getTime()) ? dataPublicacao : null,
    capaUrl,
  };

  const revista = id
    ? await prisma.revista.update({ where: { id }, data })
    : await prisma.revista.create({ data });

  revalidatePath("/erp/revistas");
  revalidatePath(`/erp/revistas/${revista.id}`);
  revalidatePath("/");
  revalidatePath(`/revistas/${revista.id}`);
  redirect(`/erp/revistas/${revista.id}`);
}

export async function updateRevistaArticleOrder(revistaId: string, articleIds: string[]) {
  await exigirPermissao("revistas:editar");

  if (!revistaId || articleIds.length === 0) {
    return;
  }

  const count = await prisma.artigo.count({
    where: {
      revistaId,
      id: { in: articleIds },
    },
  });

  if (count !== articleIds.length) {
    throw new Error("A lista contém artigos que não pertencem a esta revista.");
  }

  await prisma.$transaction(
    articleIds.map((id, index) =>
      prisma.artigo.update({
        where: { id },
        data: { ordemNaRevista: index + 1 },
      })
    )
  );

  revalidatePath(`/erp/revistas/${revistaId}`);
}

export async function deleteRevista(id: string) {
  await exigirPermissao("revistas:editar");

  await prisma.$transaction([
    prisma.artigo.updateMany({
      where: { revistaId: id },
      data: {
        revistaId: null,
        ordemNaRevista: null,
      },
    }),
    prisma.revista.delete({ where: { id } }),
  ]);

  revalidatePath("/erp/revistas");
  revalidatePath("/");
  revalidatePath(`/revistas/${id}`);
}
