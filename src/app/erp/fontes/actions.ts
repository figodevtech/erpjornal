"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function saveSource(formData: FormData) {
  const id = formData.get("id") as string | null;
  const session = id ? await exigirPermissao("fontes:editar") : await exigirPermissao("fontes:criar");

  const nome = formData.get("nome") as string;
  const cargo = (formData.get("cargo") as string) || null;
  const organizacao = (formData.get("organizacao") as string) || null;
  const email = (formData.get("email") as string) || null;
  const telefone = (formData.get("telefone") as string) || null;
  const nivelSigilo = (formData.get("nivelSigilo") as string) || "publico";
  const notas = (formData.get("notas") as string) || null;

  if (!nome) throw new Error("Nome da fonte e obrigatorio");

  const data = { nome, cargo, organizacao, email, telefone, nivelSigilo, notas };

  if (id) {
    await prisma.fonte.update({ where: { id }, data });
  } else {
    await prisma.fonte.create({ data: { ...data, criadorId: session.user.id } });
  }

  revalidatePath("/erp/fontes");
  redirect("/erp/fontes");
}

export async function saveSourceNote(formData: FormData) {
  const session = await exigirPermissao("fontes:editar");

  const fonteId = formData.get("fonte_id") as string;
  const conteudo = formData.get("conteudo") as string;
  const artigoId = (formData.get("artigo_id") as string) || null;

  if (!fonteId || !conteudo) throw new Error("Campos obrigatorios ausentes");

  const fonte = await prisma.fonte.findUnique({ where: { id: fonteId } });
  if (!fonte) throw new Error("Fonte nao encontrada");

  if (fonte.nivelSigilo === "confidencial" && !["admin", "editor"].includes(session.user.role)) {
    throw new Error("Acesso nao autorizado a fontes confidenciais.");
  }

  await prisma.notaFonte.create({
    data: {
      fonteId,
      autorId: session.user.id,
      conteudo,
      artigoId,
    },
  });

  revalidatePath(`/erp/fontes/${fonteId}`);
  redirect(`/erp/fontes/${fonteId}`);
}
