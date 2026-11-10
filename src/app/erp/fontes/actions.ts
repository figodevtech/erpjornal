"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "@/lib/auditoria";
import { NIVEIS_SIGILO, motivoBloqueioFonte, resumoFonteParaAuditoria } from "@/lib/fontes/sigilo";

type Resultado = { ok: false; error: string };

const TextoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((valor) => valor || null);

const DadosFonte = z.object({
  id: z.union([z.literal(""), z.uuid("Fonte inválida.")]),
  nome: z.string().trim().min(1, "Informe o nome da fonte.").max(200),
  cargo: TextoOpcional(200),
  organizacao: TextoOpcional(200),
  email: z.union([z.literal(""), z.email("E-mail inválido.").max(254)]).transform((valor) => valor || null),
  telefone: TextoOpcional(40),
  nivelSigilo: z.enum(NIVEIS_SIGILO, "Nível de sigilo inválido."),
  notas: TextoOpcional(5000),
});

function campo(formData: FormData, nome: string) {
  return formData.get(nome)?.toString() ?? "";
}

/**
 * Cria (fontes:criar) ou edita (fontes:editar) uma fonte. Editar uma fonte
 * confidencial exige também fontes:confidencial: sem isso, dava para sobrescrever
 * a fonte ou rebaixá-la para "publico" e expô-la a todos com fontes:ler.
 */
export async function saveSource(formData: FormData): Promise<Resultado | void> {
  const idBruto = campo(formData, "id");
  const session = idBruto ? await exigirPermissao("fontes:editar") : await exigirPermissao("fontes:criar");

  const dados = DadosFonte.safeParse({
    id: idBruto,
    nome: campo(formData, "nome"),
    cargo: campo(formData, "cargo"),
    organizacao: campo(formData, "organizacao"),
    email: campo(formData, "email"),
    telefone: campo(formData, "telefone"),
    nivelSigilo: campo(formData, "nivelSigilo") || "publico",
    notas: campo(formData, "notas"),
  });
  if (!dados.success) return { ok: false, error: dados.error.issues[0]?.message ?? "Dados da fonte inválidos." };

  const { id, ...data } = dados.data;

  if (id) {
    const atual = await prisma.fonte.findUnique({ where: { id }, select: { nome: true, nivelSigilo: true } });
    if (!atual) return { ok: false, error: "Fonte não encontrada." };
    const bloqueio = motivoBloqueioFonte(session, atual);
    if (bloqueio) return { ok: false, error: bloqueio };

    await prisma.fonte.update({ where: { id }, data });
    // Fonte é dado sigiloso: o log registra a ação e o nível, sem contato (e sem nome, se confidencial).
    await registrarAuditoria({
      usuarioId: session.user.id,
      acao: "EDICAO",
      entidade: "fonte",
      entidadeId: id,
      antes: resumoFonteParaAuditoria(atual),
      depois: resumoFonteParaAuditoria(data),
    });
  } else {
    const criada = await prisma.fonte.create({ data: { ...data, criadorId: session.user.id } });
    await registrarAuditoria({
      usuarioId: session.user.id,
      acao: "CRIACAO",
      entidade: "fonte",
      entidadeId: criada.id,
      depois: resumoFonteParaAuditoria(data),
    });
  }

  revalidatePath("/erp/fontes");
  redirect("/erp/fontes");
}

const DadosNota = z.object({
  fonteId: z.uuid("Fonte inválida."),
  conteudo: z.string().trim().min(1, "Escreva a anotação.").max(10_000),
  artigoId: z.union([z.literal(""), z.uuid()]).transform((valor) => valor || null),
});

export async function saveSourceNote(formData: FormData) {
  const session = await exigirPermissao("fontes:editar");

  const dados = DadosNota.safeParse({
    fonteId: campo(formData, "fonte_id"),
    conteudo: campo(formData, "conteudo"),
    artigoId: campo(formData, "artigo_id"),
  });
  // Form action de Server Component: sem retorno de erro na tela; dado inválido volta para a fonte.
  if (!dados.success) {
    const fonteIdBruto = z.uuid().safeParse(campo(formData, "fonte_id"));
    redirect(fonteIdBruto.success ? `/erp/fontes/${fonteIdBruto.data}` : "/erp/fontes");
  }
  const { fonteId, conteudo, artigoId } = dados.data;

  const fonte = await prisma.fonte.findUnique({ where: { id: fonteId }, select: { nivelSigilo: true } });
  if (!fonte || motivoBloqueioFonte(session, fonte)) redirect("/erp/fontes");

  const nota = await prisma.notaFonte.create({
    data: { fonteId, autorId: session.user.id, conteudo, artigoId },
    select: { id: true },
  });
  // Só o fato: o conteúdo da anotação é sigiloso.
  await registrarAuditoria({
    usuarioId: session.user.id,
    acao: "ANOTACAO",
    entidade: "fonte",
    entidadeId: fonteId,
    depois: { notaId: nota.id, artigoId },
  });

  revalidatePath(`/erp/fontes/${fonteId}`);
  redirect(`/erp/fontes/${fonteId}`);
}
