"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function saveArticle(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado");

  const titulo = formData.get("titulo") as string;
  const slug = formData.get("slug") as string;
  const resumo = formData.get("resumo") as string;
  const corpo_texto = formData.get("corpo_texto") as string;
  const categoria_id = formData.get("categoria_id") as string;
  const status_id = formData.get("status_id") as string;

  if (!titulo || !slug || !corpo_texto) {
    throw new Error("Campos obrigatórios ausentes");
  }

  const role = session.user.role;
  let finalStatus = status_id;

  // RBAC no Backend: Reporter só salva rascunho ou manda pra revisão.
  if (status_id === "publicado" && role !== "admin" && role !== "editor") {
    finalStatus = "em_revisao";
  }

  await prisma.article.create({
    data: {
      titulo,
      slug,
      resumo,
      corpo_texto,
      status_id: finalStatus,
      categoria_id: categoria_id || null,
      autor_id: session.user.id,
      data_publicacao: finalStatus === "publicado" ? new Date() : null,
    }
  });

  revalidatePath("/erp/artigos");
  redirect("/erp/artigos");
}
