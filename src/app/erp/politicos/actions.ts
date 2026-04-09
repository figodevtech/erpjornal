"use server";

import { revalidatePath } from "next/cache";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function upsertPolitician(formData: FormData) {
  await exigirPermissao("politicos:gerir");

  const id = formData.get("id") as string | null;
  const nome = formData.get("nome") as string;
  const cargo = formData.get("cargo") as string;
  const partido = formData.get("partido") as string;
  const regiao = formData.get("regiao") as string;
  const estado = formData.get("estado") as string;
  const biografia = formData.get("biografia") as string;

  if (!nome) throw new Error("O nome e obrigatorio.");

  const data = {
    nome,
    cargo,
    partido,
    regiao,
    estado,
    biografia,
  };

  if (id) {
    await prisma.politico.update({ where: { id }, data });
  } else {
    await prisma.politico.create({ data });
  }

  revalidatePath("/erp/politicos");
}

export async function deletePolitician(id: string) {
  await exigirPermissao("politicos:gerir");
  await prisma.politico.delete({ where: { id } });
  revalidatePath("/erp/politicos");
}

export async function getPoliticians() {
  await exigirPermissao("politicos:gerir");
  return prisma.politico.findMany({
    orderBy: { nome: "asc" },
  });
}
