"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function upsertPolitician(formData: FormData) {
  const id = formData.get("id") as string | null;
  await exigirPermissao(id ? "entidades:editar" : "entidades:criar");

  const nome = ((formData.get("nome") as string) || "").trim() || null;
  const cpf = ((formData.get("cpf") as string) || "").replace(/\D/g, "") || null;
  const cnpj = ((formData.get("cnpj") as string) || "").replace(/\D/g, "") || null;
  const categoriaEntidade = ((formData.get("categoriaEntidade") as string) || "").trim() || null;
  const cargo = ((formData.get("cargo") as string) || "").trim() || null;
  const partido = ((formData.get("partido") as string) || "").trim() || null;
  const regiao = ((formData.get("regiao") as string) || "").trim() || null;
  const estado = ((formData.get("estado") as string) || "").trim().toUpperCase().slice(0, 2) || null;
  const biografia = ((formData.get("biografia") as string) || "").trim() || null;

  const data = {
    nome,
    cpf,
    cnpj,
    categoriaEntidade,
    cargo,
    partido,
    regiao,
    estado,
    biografia,
  };

  if (id) {
    await prisma.$executeRaw`
      update public.politicos
      set
        nome = ${data.nome},
        cpf = ${data.cpf},
        cnpj = ${data.cnpj},
        categoria_entidade = ${data.categoriaEntidade},
        cargo = ${data.cargo},
        partido = ${data.partido},
        regiao = ${data.regiao},
        estado = ${data.estado},
        biografia = ${data.biografia},
        atualizado_em = now()
      where id = ${id}::uuid
    `;
  } else {
    await prisma.$executeRaw`
      insert into public.politicos (
        id,
        nome,
        cpf,
        cnpj,
        categoria_entidade,
        cargo,
        partido,
        regiao,
        estado,
        biografia,
        atualizado_em
      )
      values (
        ${randomUUID()}::uuid,
        ${data.nome},
        ${data.cpf},
        ${data.cnpj},
        ${data.categoriaEntidade},
        ${data.cargo},
        ${data.partido},
        ${data.regiao},
        ${data.estado},
        ${data.biografia},
        now()
      )
    `;
  }

  revalidatePath("/erp/entidades");
}

export async function deletePolitician(id: string) {
  await exigirPermissao("entidades:editar");
  await prisma.politico.delete({ where: { id } });
  revalidatePath("/erp/entidades");
}

export async function getPoliticians() {
  await exigirPermissao("entidades:ler");
  return prisma.$queryRaw<
    Array<{
      id: string;
      nome: string | null;
      cpf: string | null;
      cnpj: string | null;
      categoriaEntidade: string | null;
      cargo: string | null;
      partido: string | null;
      biografia: string | null;
      regiao: string | null;
      estado: string | null;
    }>
  >`
    select
      id,
      nome,
      cpf,
      cnpj,
      categoria_entidade as "categoriaEntidade",
      cargo,
      partido,
      biografia,
      regiao,
      estado
    from public.politicos
    order by nome asc nulls last, criado_em desc
  `;
}
