"use server";

import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "@/lib/auditoria";

type ResultadoAcao = { ok: true } | { ok: false; error: string };

function texto(formData: FormData, campo: string) {
  return ((formData.get(campo) as string) || "").trim() || null;
}

function apenasDigitos(formData: FormData, campo: string) {
  return ((formData.get(campo) as string) || "").replace(/\D/g, "") || null;
}

export async function upsertPolitician(formData: FormData): Promise<ResultadoAcao> {
  const id = formData.get("id") as string | null;
  const sessao = await exigirPermissao(id ? "entidades:editar" : "entidades:criar");

  const data = {
    nome: texto(formData, "nome"),
    // Vazio vira null: o índice único do banco permite vários NULL, mas não várias strings vazias.
    cpf: apenasDigitos(formData, "cpf"),
    cnpj: apenasDigitos(formData, "cnpj"),
    categoriaEntidade: texto(formData, "categoriaEntidade"),
    cargo: texto(formData, "cargo"),
    partido: texto(formData, "partido"),
    regiao: texto(formData, "regiao"),
    estado: texto(formData, "estado")?.toUpperCase().slice(0, 2) || null,
    biografia: texto(formData, "biografia"),
  };

  try {
    const salvo = id
      ? await prisma.politico.update({ where: { id }, data })
      : await prisma.politico.create({ data });
    await registrarAuditoria({ usuarioId: sessao.user.id, acao: id ? "EDICAO" : "CRIACAO", entidade: "entidade", entidadeId: salvo.id, depois: data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const campos = String(error.meta?.target ?? "");
      const documento = campos.includes("cnpj") ? "CNPJ" : "CPF";
      return { ok: false, error: `Já existe uma entidade cadastrada com este ${documento}.` };
    }
    console.error("Erro ao salvar entidade:", error);
    return { ok: false, error: "Erro ao salvar entidade." };
  }

  revalidatePath("/erp/entidades");
  return { ok: true };
}

export async function deletePolitician(id: string) {
  const sessao = await exigirPermissao("entidades:editar");
  // Exclusão lógica (PRD: nada é apagado fisicamente).
  await prisma.$transaction(async (tx) => {
    const anterior = await tx.politico.update({ where: { id }, data: { excluidoEm: new Date() } });
    await registrarAuditoria({ usuarioId: sessao.user.id, acao: "EXCLUSAO", entidade: "entidade", entidadeId: id, antes: anterior }, tx);
  });
  revalidatePath("/erp/entidades");
}

export async function getPoliticians() {
  await exigirPermissao("entidades:ler");
  return prisma.politico.findMany({
    select: {
      id: true,
      nome: true,
      cpf: true,
      cnpj: true,
      categoriaEntidade: true,
      cargo: true,
      partido: true,
      biografia: true,
      regiao: true,
      estado: true,
    },
    orderBy: [{ nome: { sort: "asc", nulls: "last" } }, { criadoEm: "desc" }],
  });
}
