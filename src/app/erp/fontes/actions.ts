"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "@/lib/auditoria";

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

  const salva = id
    ? await prisma.fonte.update({ where: { id }, data })
    : await prisma.fonte.create({ data: { ...data, criadorId: session.user.id } });
  // Fonte é dado sigiloso: o log registra a ação, não o conteúdo de contato.
  await registrarAuditoria({ usuarioId: session.user.id, acao: id ? "EDICAO" : "CRIACAO", entidade: "fonte", entidadeId: salva.id, depois: { nome: data.nome, nivelSigilo: data.nivelSigilo } });

  revalidatePath("/erp/fontes");
  redirect("/erp/fontes");
}

export async function saveSourceNote(formData: FormData) {
  const session = await exigirPermissao("fontes:editar");

  const fonteId = formData.get("fonte_id") as string;
  const conteudo = formData.get("conteudo") as string;
  const artigoId = (formData.get("artigo_id") as string) || null;

  if (!fonteId || !conteudo) throw new Error("Campos obrigatórios ausentes");

  const fonte = await prisma.fonte.findUnique({ where: { id: fonteId } });
  if (!fonte) throw new Error("Fonte não encontrada");

  if (fonte.nivelSigilo === "confidencial" && !temPermissao(session, "fontes:confidencial")) {
    throw new Error("Acesso não autorizado a fontes confidenciais.");
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
