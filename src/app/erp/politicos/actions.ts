"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function upsertPolitician(formData: FormData) {
  const id = formData.get("id") as string | null;
  const nome = formData.get("nome") as string;
  const cargo = formData.get("cargo") as string;
  const partido = formData.get("partido") as string;
  const regiao = formData.get("regiao") as string;
  const estado = formData.get("estado") as string;
  const biografia = formData.get("biografia") as string;

  if (!nome) throw new Error("O nome é obrigatório.");

  const data = {
    nome,
    cargo,
    partido,
    regiao,
    estado,
    biografia,
  };

  if (id) {
    await prisma.politician.update({ where: { id }, data });
  } else {
    await prisma.politician.create({ data });
  }

  revalidatePath("/erp/politicos");
}

export async function deletePolitician(id: string) {
  await prisma.politician.delete({ where: { id } });
  revalidatePath("/erp/politicos");
}

export async function getPoliticians() {
  return await prisma.politician.findMany({
    orderBy: { nome: "asc" }
  });
}
