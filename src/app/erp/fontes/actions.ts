"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function saveSource(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado");

  const id = formData.get("id") as string | null;
  const nome = formData.get("nome") as string;
  const cargo = formData.get("cargo") as string || null;
  const organizacao = formData.get("organizacao") as string || null;
  const email = formData.get("email") as string || null;
  const telefone = formData.get("telefone") as string || null;
  const nivel_sigilo = formData.get("nivel_sigilo") as string || "publico";
  const notas = formData.get("notas") as string || null;

  if (!nome) throw new Error("Nome da fonte é obrigatório");

  const data = { nome, cargo, organizacao, email, telefone, nivel_sigilo, notas };

  if (id) {
    await prisma.source.update({ where: { id }, data });
  } else {
    await prisma.source.create({ data: { ...data, criador_id: session.user.id } });
  }

  revalidatePath("/erp/fontes");
  redirect("/erp/fontes");
}

export async function saveSourceNote(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado");

  const source_id = formData.get("source_id") as string;
  const conteudo = formData.get("conteudo") as string;
  const article_id = formData.get("article_id") as string || null;

  if (!source_id || !conteudo) throw new Error("Campos obrigatórios ausentes");

  const source = await prisma.source.findUnique({ where: { id: source_id } });
  if (!source) throw new Error("Fonte não encontrada");

  // Sigilo: apenas admin/editor pode ver fontes confidenciais
  if (source.nivel_sigilo === "confidencial") {
    const role = session.user.role;
    if (role !== "admin" && role !== "editor") {
      throw new Error("Acesso não autorizado a fontes confidenciais.");
    }
  }

  await prisma.sourceNote.create({
    data: {
      source_id,
      autor_id: session.user.id,
      conteudo,
      article_id: article_id || null,
    }
  });

  revalidatePath(`/erp/fontes/${source_id}`);
  redirect(`/erp/fontes/${source_id}`);
}
