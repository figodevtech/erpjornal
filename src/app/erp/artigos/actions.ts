"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirAlgumaPermissao, exigirPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";

export async function saveArticle(formData: FormData) {
  const id = formData.get("id") as string | null;
  const session = id
    ? await exigirAlgumaPermissao(["artigos:editar", "artigos:publicar"])
    : await exigirPermissao("artigos:criar");

  const titulo = formData.get("titulo") as string;
  const slug = formData.get("slug") as string;
  const resumo = formData.get("resumo") as string;
  const corpoTexto = formData.get("corpoTexto") as string;
  const categoriaId = formData.get("categoriaId") as string;
  const status = formData.get("status") as string;
  const observacoesLegais = (formData.get("observacoesLegais") as string) || null;
  const statusLegal = (formData.get("statusLegal") as string) || "pendente";
  const rawDate = formData.get("dataPublicacao") as string;
  const canaisPublicacao = formData.getAll("canaisPublicacao") as string[];
  const urlFonte = (formData.get("urlFonte") as string) || null;
  const autorExterno = (formData.get("autorExterno") as string) || null;

  if (!titulo || !slug || !corpoTexto) {
    throw new Error("Campos obrigatorios ausentes");
  }

  const role = session.user.role;
  const podePublicar = temPermissao(session, "artigos:publicar");
  const podeEditar = temPermissao(session, "artigos:editar");
  let finalStatus = status;

  if (status === "publicado" && !podePublicar) {
    finalStatus = "em_revisao";
  }

  let dataPublicacao: Date | null = null;
  if (finalStatus === "publicado") {
    if (rawDate) {
      const parsedDate = new Date(rawDate);
      dataPublicacao = !isNaN(parsedDate.getTime()) ? parsedDate : new Date();
    } else {
      dataPublicacao = null;
    }
  }

  const regiao = (formData.get("regiao") as string) || "Nacional";
  const estadoRaw = (formData.get("estado") as string) || "";
  const estado = estadoRaw.toUpperCase().slice(0, 2) || null;

  const data = {
    titulo,
    slug,
    resumo,
    corpoTexto,
    status: finalStatus as ArticleStatus,
    categoriaId: categoriaId || null,
    observacoesLegais,
    statusLegal,
    dataPublicacao,
    regiao,
    estado,
    canaisPublicacao,
    urlFonte,
    autorExterno,
  };

  const factChecksCount = parseInt((formData.get("checagensFato_count") as string) || "0");
  const factChecks = [];
  for (let i = 0; i < factChecksCount; i++) {
    const urlFonteChecagem = formData.get(`fact_check_url_${i}`) as string;
    const urlDocumento = formData.get(`fact_check_doc_${i}`) as string;
    const statusVerificacao = formData.get(`fact_check_status_${i}`) as string;
    if (urlFonteChecagem || urlDocumento) {
      factChecks.push({ urlFonte: urlFonteChecagem, urlDocumento, statusVerificacao });
    }
  }

  const politicoIds = formData.getAll("politicoIds") as string[];

  if (id) {
    if (!podeEditar && !podePublicar) {
      throw new Error("Voce nao tem permissao para editar este artigo.");
    }

    const existing = await prisma.artigo.findUnique({ where: { id } });
    if (!existing) throw new Error("Artigo nao encontrado");

    if (role === "reporter" && existing.autorId !== session.user.id) {
      throw new Error("Voce nao tem permissao para editar este artigo.");
    }

    let finalPublishDate = dataPublicacao;
    if (finalStatus === "publicado" && !finalPublishDate) {
      finalPublishDate = existing.dataPublicacao || new Date();
    } else if (finalStatus !== "publicado") {
      finalPublishDate = null;
    }

    await prisma.artigo.update({
      where: { id },
      data: {
        ...data,
        dataPublicacao: finalPublishDate,
        checagensFato: {
          deleteMany: {},
          create: factChecks,
        },
        artigosPoliticos: {
          deleteMany: {},
          create: politicoIds.map((politicoId) => ({
            politico: {
              connect: { id: politicoId },
            },
          })),
        },
      },
    });

    await prisma.logAcao.create({
      data: {
        usuarioId: session.user.id,
        acao:
          finalStatus === "publicado" && existing.status !== "publicado"
            ? "PUBLICACAO"
            : "EDICAO",
        artigoId: id,
      },
    });
  } else {
    const novoArtigo = await prisma.artigo.create({
      data: {
        ...data,
        dataPublicacao: finalStatus === "publicado" ? dataPublicacao || new Date() : null,
        autorId: session.user.id,
        checagensFato: {
          create: factChecks,
        },
        artigosPoliticos: {
          create: politicoIds.map((politicoId) => ({
            politico: {
              connect: { id: politicoId },
            },
          })),
        },
      },
    });

    await prisma.logAcao.create({
      data: {
        usuarioId: session.user.id,
        acao: finalStatus === "publicado" ? "CRIACAO_E_PUBLICACAO" : "CRIACAO",
        artigoId: novoArtigo.id,
      },
    });
  }

  revalidatePath("/erp/artigos");
  revalidatePath("/");
  revalidatePath("/noticia/[slug]", "page");
  revalidatePath("/categoria/[slug]", "page");
  redirect("/erp/artigos");
}

export async function updateArticleStatus(id: string, newStatus: ArticleStatus) {
  const session = await exigirAlgumaPermissao(["artigos:editar", "artigos:publicar"]);

  const artigo = await prisma.artigo.findUnique({
    where: { id },
    select: {
      status: true,
      autorId: true,
      titulo: true,
      resumo: true,
      corpoTexto: true,
      dataPublicacao: true,
    },
  });

  if (!artigo) throw new Error("Artigo nao encontrado");

  const podePublicar = temPermissao(session, "artigos:publicar");
  const podeEditar = temPermissao(session, "artigos:editar");

  if (newStatus === "publicado" && !podePublicar) {
    throw new Error("Voce nao tem permissao para publicar.");
  }

  if (newStatus !== "publicado" && !podeEditar) {
    throw new Error("Voce nao tem permissao para alterar o fluxo editorial.");
  }

  await prisma.versaoArtigo.create({
    data: {
      artigoId: id,
      titulo: artigo.titulo,
      resumo: artigo.resumo,
      corpoTexto: artigo.corpoTexto,
      status: artigo.status,
      usuarioId: session.user.id,
      resumoMudancas: `Mudanca de status via Kanban para: ${newStatus}`,
    },
  });

  await prisma.artigo.update({
    where: { id },
    data: {
      status: newStatus,
      dataPublicacao: newStatus === "publicado" ? artigo.dataPublicacao || new Date() : null,
    },
  });

  await prisma.logAcao.create({
    data: {
      usuarioId: session.user.id,
      acao: `MOVER_KANBAN: ${artigo.status} -> ${newStatus}`,
      artigoId: id,
    },
  });

  revalidatePath("/erp/artigos");
  revalidatePath("/erp/artigos/kanban");
  revalidatePath("/");
  revalidatePath("/noticia/[slug]", "page");
  revalidatePath("/categoria/[slug]", "page");
}

export async function updateArticleAuthor(artigoId: string, newAuthorId: string) {
  const session = await exigirPermissao("artigos:editar");

  await prisma.artigo.update({
    where: { id: artigoId },
    data: { autorId: newAuthorId },
  });

  await prisma.logAcao.create({
    data: {
      usuarioId: session.user.id,
      acao: `ATRIBUIR_AUTOR: ${newAuthorId}`,
      artigoId,
    },
  });

  revalidatePath("/erp/artigos/kanban");
}

export async function getArticleVersions(artigoId: string) {
  await exigirAlgumaPermissao(["artigos:ler", "artigos:editar", "artigos:publicar"]);

  const versions = await prisma.versaoArtigo.findMany({
    where: { artigoId },
    orderBy: { criadoEm: "desc" },
  });

  return JSON.parse(JSON.stringify(versions));
}
