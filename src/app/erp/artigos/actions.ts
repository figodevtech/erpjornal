"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function saveArticle(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado");

  const id = formData.get("id") as string | null;
  const titulo = formData.get("titulo") as string;
  const slug = formData.get("slug") as string;
  const resumo = formData.get("resumo") as string;
  const corpo_texto = formData.get("corpo_texto") as string;
  const categoria_id = formData.get("categoria_id") as string;
  const status_id = formData.get("status_id") as string;
  const rawDate = formData.get("data_publicacao") as string;

  if (!titulo || !slug || !corpo_texto) {
    throw new Error("Campos obrigatórios ausentes");
  }

  const role = session.user.role;
  let finalStatus = status_id;

  // RBAC no Backend: Reporter só salva rascunho ou manda pra revisão.
  if (status_id === "publicado" && role !== "admin" && role !== "editor") {
    finalStatus = "em_revisao";
  }

  let data_publicacao = finalStatus === "publicado" ? new Date() : null;
  if (finalStatus === "publicado" && rawDate) {
    const parsedDate = new Date(rawDate);
    if (!isNaN(parsedDate.getTime())) {
      data_publicacao = parsedDate;
    }
  }

  const data = {
    titulo,
    slug,
    resumo,
    corpo_texto,
    status_id: finalStatus,
    categoria_id: categoria_id || null,
    data_publicacao,
  };

  if (id) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new Error("Artigo não encontrado");
    
    // Validando edição: Repórter não pode alterar artigo alheio
    if (role === "reporter" && existing.autor_id !== session.user.id) {
      throw new Error("Você não tem permissão para editar este artigo.");
    }
    
    await prisma.article.update({
      where: { id },
      data: {
        ...data,
        data_publicacao: data_publicacao || existing.data_publicacao,
      }
    });
  } else {
    await prisma.article.create({
      data: {
        ...data,
        autor_id: session.user.id,
      }
    });
  }

  revalidatePath("/erp/artigos");
  redirect("/erp/artigos");
}
