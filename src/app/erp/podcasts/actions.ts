"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registrarAuditoria } from "@/lib/auditoria";

export async function savePodcast(formData: FormData) {
  const id = formData.get("id") as string | null;
  const sessao = await (id ? exigirPermissao("podcasts:editar") : exigirPermissao("podcasts:criar"));

  const titulo = formData.get("titulo") as string;
  const slug = formData.get("slug") as string;
  const descricao = (formData.get("descricao") as string) || null;
  const urlAudio = formData.get("urlAudio") as string;
  const urlCapa = (formData.get("urlCapa") as string) || null;
  const duracaoRaw = formData.get("duracao") as string;
  const duracao = duracaoRaw ? parseInt(duracaoRaw) : null;
  const status = (formData.get("status") as string) || "draft";
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map((tag) => tag.trim()) : [];

  if (!titulo || !slug || !urlAudio) throw new Error("Campos obrigatorios ausentes");

  const data = {
    titulo,
    slug,
    descricao,
    urlAudio,
    urlCapa,
    duracao,
    status,
    tags,
  };

  const salvo = id
    ? await prisma.episodioPodcast.update({ where: { id }, data })
    : await prisma.episodioPodcast.create({ data });
  await registrarAuditoria({ usuarioId: sessao.user.id, acao: id ? "EDICAO" : "CRIACAO", entidade: "podcast", entidadeId: salvo.id, depois: data });

  revalidatePath("/erp/podcasts");
  revalidatePath("/podcasts");
  redirect("/erp/podcasts");
}
