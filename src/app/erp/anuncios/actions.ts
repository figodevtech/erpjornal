"use server";

import { revalidatePath } from "next/cache";

import { AD_PAGE_TYPES, AD_PLACEMENTS, getAdPlacement } from "@/lib/ads";
import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "@/lib/auditoria";
import { revalidarPortalInteiro } from "@/lib/cache/portal";

function readString(formData: FormData, key: string) {
  return (formData.get(key)?.toString() ?? "").trim();
}

function readDate(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value ? new Date(`${value}T00:00:00`) : null;
}

function filterAllowed(values: FormDataEntryValue[], allowed: readonly { value: string }[]) {
  const allowedValues = new Set(allowed.map((item) => item.value));
  return Array.from(new Set(values.map((value) => value.toString()).filter((value) => allowedValues.has(value))));
}

function isPrismaError(error: unknown): error is { code: string } {
  return typeof error === "object" && error !== null && "code" in error;
}

export async function salvarAnuncio(formData: FormData) {
  const id = readString(formData, "id") || null;
  const sessao = await exigirPermissao(id ? "anuncios:editar" : "anuncios:criar");

  const titulo = readString(formData, "titulo");
  const imagemUrl = readString(formData, "imagemUrl");
  const linkUrl = readString(formData, "linkUrl");
  const altText = readString(formData, "altText") || null;
  const placementInput = readString(formData, "placement");
  const prioridade = Number.parseInt(readString(formData, "prioridade") || "0", 10);
  const paginas = filterAllowed(formData.getAll("paginas"), AD_PAGE_TYPES);
  const dataInicio = readDate(formData, "dataInicio");
  const dataFim = readDate(formData, "dataFim");
  const ativo = formData.get("ativo") === "on";
  const placement = getAdPlacement(placementInput);

  if (!titulo) throw new Error("Informe o titulo do anuncio.");
  if (!imagemUrl) throw new Error("Informe a URL da imagem.");
  if (!linkUrl) throw new Error("Informe o link de destino.");
  if (paginas.length === 0) throw new Error("Selecione pelo menos um tipo de pagina.");
  if (!AD_PLACEMENTS.some((item) => item.value === placementInput)) {
    throw new Error("Selecione um modelo de espaco valido para o anuncio.");
  }
  if (dataInicio && dataFim && dataFim < dataInicio) {
    throw new Error("A data final não pode ser anterior à data inicial.");
  }

  const tamanho = placement.tamanho;
  const posicoes = [...placement.posicoes];

  try {
    const dados = { titulo, imagemUrl, linkUrl, altText, tamanho, paginas, posicoes, ativo, prioridade, dataInicio, dataFim };
    const salvo = id
      ? await prisma.anuncio.update({ where: { id }, data: dados })
      : await prisma.anuncio.create({ data: dados });
    await registrarAuditoria({ usuarioId: sessao.user.id, acao: id ? "EDICAO" : "CRIACAO", entidade: "anuncio", entidadeId: salvo.id, depois: dados });
  } catch (error: unknown) {
    if (isPrismaError(error) && error.code === "P2025") {
      throw new Error("Anúncio não encontrado.");
    }
    throw error;
  }

  revalidatePath("/erp/anuncios");
  // Anúncios aparecem em todas as páginas do portal.
  revalidarPortalInteiro();
}

export async function excluirAnuncio(id: string) {
  const sessao = await exigirPermissao("anuncios:editar");
  // Exclusão lógica (PRD: nada é apagado fisicamente).
  await prisma.$transaction(async (tx) => {
    const anterior = await tx.anuncio.update({ where: { id }, data: { excluidoEm: new Date() } });
    await registrarAuditoria({ usuarioId: sessao.user.id, acao: "EXCLUSAO", entidade: "anuncio", entidadeId: id, antes: anterior }, tx);
  });

  revalidatePath("/erp/anuncios");
  // Anúncios aparecem em todas as páginas do portal.
  revalidarPortalInteiro();
}
