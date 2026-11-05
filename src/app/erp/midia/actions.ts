"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirAlgumaPermissao, exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "@/lib/auditoria";

export async function suggestMediaTags(nome: string, tipo: string) {
  await exigirAlgumaPermissao(["midia:criar", "midia:editar"]);

  const lowerNome = nome.toLowerCase();
  const tags = ["Revista Gestao", "Midia Oficial", tipo];

  if (lowerNome.includes("plenario") || lowerNome.includes("camara")) {
    tags.push("Legislativo", "Politica", "Parlamento");
  }
  if (lowerNome.includes("votacao") || lowerNome.includes("urna")) {
    tags.push("Democracia", "Eleicoes");
  }
  if (lowerNome.includes("governo") || lowerNome.includes("ministro")) {
    tags.push("Executivo", "Governo Federal");
  }

  return Array.from(new Set(tags));
}

export async function saveMedia(formData: FormData) {
  const id = formData.get("id") as string | null;
  const sessao = await (id ? exigirPermissao("midia:editar") : exigirPermissao("midia:criar"));

  const url = formData.get("url") as string;
  const nome = formData.get("nome") as string;
  const tipo = formData.get("tipo") as string;
  const mimeType = (formData.get("mimeType") as string) || null;
  const tamanhoRaw = formData.get("tamanho") as string;
  const tamanho = tamanhoRaw ? parseInt(tamanhoRaw) : null;
  const direitosAutorais = (formData.get("direitosAutorais") as string) || null;
  const tipoLicenca = (formData.get("tipoLicenca") as string) || null;
  const fonte = (formData.get("fonte") as string) || null;
  const dataExpiracaoRaw = formData.get("dataExpiracao") as string;
  const dataExpiracao = dataExpiracaoRaw ? new Date(dataExpiracaoRaw) : null;
  const tagsIaRaw = formData.get("tagsIa") as string;
  const tagsIa = tagsIaRaw ? JSON.parse(tagsIaRaw) : null;

  if (!url || !nome || !tipo) throw new Error("Campos obrigatorios ausentes");

  const data = {
    url,
    nome,
    tipo,
    mimeType,
    tamanho,
    direitosAutorais,
    tipoLicenca,
    fonte,
    dataExpiracao,
    tagsIa,
  };

  const salva = id ? await prisma.midia.update({ where: { id }, data }) : await prisma.midia.create({ data });
  await registrarAuditoria({ usuarioId: sessao.user.id, acao: id ? "EDICAO" : "CRIACAO", entidade: "midia", entidadeId: salva.id, depois: { nome, tipo, url } });

  revalidatePath("/erp/midia");
  redirect("/erp/midia");
}
