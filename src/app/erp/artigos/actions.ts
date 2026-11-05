"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirAlgumaPermissao, exigirPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizarHtmlArtigo } from "@/lib/html/sanitize";
import {
  motivoBloqueioExclusao,
  motivoBloqueioMudancaStatus,
  podeEditarArtigo,
} from "@/lib/editorial/permissoes-artigo";
import {
  isStatusArtigo,
  resolverStatusAoSalvar,
  type StatusArtigo,
} from "@/lib/editorial/status";

function lerDataPublicacao(valor: string | null): Date | null {
  if (!valor) return null;
  const data = new Date(valor);
  return isNaN(data.getTime()) ? null : data;
}

export async function saveArticle(formData: FormData) {
  const id = formData.get("id") as string | null;
  const session = id
    ? await exigirAlgumaPermissao(["artigos:editar", "artigos:publicar"])
    : await exigirPermissao("artigos:criar");

  const titulo = formData.get("titulo") as string;
  const slug = formData.get("slug") as string;
  const resumo = formData.get("resumo") as string;
  // Barreira contra XSS: todo HTML de matéria é sanitizado antes de ir para o banco.
  const corpoTexto = sanitizarHtmlArtigo(formData.get("corpoTexto") as string);
  const categoriaId = formData.get("categoriaId") as string;
  const statusSolicitado = formData.get("status");
  const dataSolicitada = lerDataPublicacao(formData.get("dataPublicacao") as string | null);
  const canaisPublicacao = formData.getAll("canaisPublicacao") as string[];
  const urlFonte = (formData.get("urlFonte") as string) || null;
  const autorExterno = (formData.get("autorExterno") as string) || null;
  const requestedRevistaId = (formData.get("revistaId") as string) || null;
  const urlImagemOg = (formData.get("urlImagemOg") as string) || null;

  if (!titulo || !slug || !corpoTexto) {
    throw new Error("Campos obrigatorios ausentes");
  }

  const podePublicar = temPermissao(session, "artigos:publicar");
  const podeEditar = temPermissao(session, "artigos:editar");
  const observacoesLegais = podeEditar ? (formData.get("observacoesLegais") as string) || null : null;
  const statusLegal = podeEditar ? (formData.get("statusLegal") as string) || "pendente" : "pendente";
  // Só quem publica pode definir a data de publicação.
  const dataPublicacaoPermitida = podePublicar ? dataSolicitada : null;

  const regiao = (formData.get("regiao") as string) || "Nacional";
  const estadoRaw = (formData.get("estado") as string) || "";
  const estado = estadoRaw.toUpperCase().slice(0, 2) || null;

  const data = {
    titulo,
    slug,
    resumo,
    corpoTexto,
    categoriaId: categoriaId || null,
    observacoesLegais,
    statusLegal,
    regiao,
    estado,
    canaisPublicacao,
    urlFonte,
    autorExterno,
    urlImagemOg,
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
  const entidadesRelacionadas = politicoIds.map((politicoId) => ({
    politicoId,
    papel: ((formData.get(`entidadePapel_${politicoId}`) as string) || "").trim() || null,
  }));
  let previousRevistaId: string | null = null;

  if (id) {
    if (!podeEditar && !podePublicar) {
      throw new Error("Voce nao tem permissao para editar este artigo.");
    }

    const existing = await prisma.artigo.findUnique({ where: { id } });
    if (!existing) throw new Error("Artigo nao encontrado");
    previousRevistaId = existing.revistaId;

    if (!podeEditarArtigo(session, existing)) {
      throw new Error("Voce nao tem permissao para editar este artigo.");
    }

    const finalStatus = resolverStatusAoSalvar({
      solicitado: statusSolicitado,
      atual: existing.status,
      podePublicar,
    });
    const finalPublishDate =
      finalStatus === "publicado"
        ? dataPublicacaoPermitida ?? existing.dataPublicacao ?? new Date()
        : null;

    const revistaId = existing.revistaId;
    const ordemNaRevista = revistaId ? existing.ordemNaRevista : null;

    await prisma.artigo.update({
      where: { id },
      data: {
        ...data,
        status: finalStatus,
        revistaId,
        dataPublicacao: finalPublishDate,
        ordemNaRevista,
        checagensFato: {
          deleteMany: {},
          create: factChecks,
        },
        artigosPoliticos: {
          deleteMany: {},
          create: entidadesRelacionadas.map(({ politicoId, papel }) => ({
            papel,
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
    const finalStatus = resolverStatusAoSalvar({
      solicitado: statusSolicitado,
      atual: null,
      podePublicar,
    });
    const revistaId = requestedRevistaId;
    const ordemNaRevista = revistaId ? (await prisma.artigo.count({ where: { revistaId } })) + 1 : null;

    const novoArtigo = await prisma.artigo.create({
      data: {
        ...data,
        status: finalStatus,
        revistaId,
        dataPublicacao: finalStatus === "publicado" ? dataPublicacaoPermitida ?? new Date() : null,
        autorId: session.user.id,
        ordemNaRevista,
        checagensFato: {
          create: factChecks,
        },
        artigosPoliticos: {
          create: entidadesRelacionadas.map(({ politicoId, papel }) => ({
            papel,
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
  const finalRevistaId = id ? previousRevistaId : requestedRevistaId;
  if (finalRevistaId) {
    revalidatePath(`/erp/revistas/${finalRevistaId}`);
  }
  if (previousRevistaId && previousRevistaId !== finalRevistaId) {
    revalidatePath(`/erp/revistas/${previousRevistaId}`);
  }
  revalidatePath("/");
  revalidatePath("/noticia/[slug]", "page");
  revalidatePath("/categoria/[slug]", "page");
  redirect(finalRevistaId ? `/erp/revistas/${finalRevistaId}` : "/erp/artigos");
}

type ResultadoAcao = { ok: true } | { ok: false; error: string };

/**
 * Move o artigo de etapa (Kanban). Retorna { ok, error } em vez de lançar:
 * o Next esconde a mensagem de erros lançados por server actions em produção.
 */
export async function updateArticleStatus(id: string, newStatus: StatusArtigo): Promise<ResultadoAcao> {
  const session = await exigirAlgumaPermissao(["artigos:editar", "artigos:publicar"]);

  // Server actions recebem dados do cliente: valida o status antes de usar.
  if (!isStatusArtigo(newStatus)) {
    return { ok: false, error: "Status de artigo inválido." };
  }

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

  if (!artigo) return { ok: false, error: "Artigo não encontrado." };
  if (artigo.status === newStatus) return { ok: true };

  // Autor ou editar_todos; publicar/despublicar/arquivar exige artigos:publicar.
  const bloqueio = motivoBloqueioMudancaStatus(session, artigo, newStatus);
  if (bloqueio) return { ok: false, error: bloqueio };

  await prisma.$transaction([
    prisma.versaoArtigo.create({
      data: {
        artigoId: id,
        titulo: artigo.titulo,
        resumo: artigo.resumo,
        corpoTexto: artigo.corpoTexto,
        status: artigo.status,
        usuarioId: session.user.id,
        resumoMudancas: `Mudanca de status via Kanban para: ${newStatus}`,
      },
    }),
    prisma.artigo.update({
      where: { id },
      data: {
        status: newStatus,
        dataPublicacao: newStatus === "publicado" ? artigo.dataPublicacao || new Date() : null,
      },
    }),
    prisma.logAcao.create({
      data: {
        usuarioId: session.user.id,
        acao: `MOVER_KANBAN: ${artigo.status} -> ${newStatus}`,
        artigoId: id,
      },
    }),
  ]);

  revalidatePath("/erp/artigos");
  revalidatePath("/erp/artigos/kanban");
  revalidatePath("/");
  revalidatePath("/noticia/[slug]", "page");
  revalidatePath("/categoria/[slug]", "page");
  return { ok: true };
}

export async function deleteArticle(
  id: string
): Promise<{ ok: true; revistaId: string | null } | { ok: false; error: string }> {
  const session = await exigirAlgumaPermissao(["artigos:editar", "artigos:publicar"]);

  const artigo = await prisma.artigo.findUnique({
    where: { id },
    select: {
      id: true,
      autorId: true,
      status: true,
      revistaId: true,
      slug: true,
      titulo: true,
    },
  });

  if (!artigo) {
    return { ok: false, error: "Artigo não encontrado." };
  }

  // Quem pode editar; artigo publicado exige também artigos:publicar.
  const bloqueio = motivoBloqueioExclusao(session, artigo);
  if (bloqueio) return { ok: false, error: bloqueio };

  await prisma.$transaction([
    prisma.artigo.delete({ where: { id } }),
    prisma.logAcao.create({
      data: {
        usuarioId: session.user.id,
        acao: `EXCLUSAO_ARTIGO: ${artigo.slug}`,
        artigoId: null,
      },
    }),
  ]);

  revalidatePath("/erp/artigos");
  revalidatePath("/erp/artigos/kanban");
  if (artigo.revistaId) {
    revalidatePath(`/erp/revistas/${artigo.revistaId}`);
  }
  revalidatePath("/");
  revalidatePath("/noticia/[slug]", "page");
  revalidatePath("/categoria/[slug]", "page");

  return { ok: true, revistaId: artigo.revistaId };
}

/** Atribui outro autor ao artigo (ação de editor: exige artigos:editar_todos). */
export async function updateArticleAuthor(artigoId: string, newAuthorId: string): Promise<ResultadoAcao> {
  const session = await exigirPermissao("artigos:editar_todos");

  const novoAutor = await prisma.usuario.findUnique({
    where: { id: newAuthorId },
    select: { id: true, status: true },
  });
  if (!novoAutor || novoAutor.status !== "ativo") {
    return { ok: false, error: "Autor inválido ou inativo." };
  }

  await prisma.$transaction([
    prisma.artigo.update({
      where: { id: artigoId },
      data: { autorId: newAuthorId },
    }),
    prisma.logAcao.create({
      data: {
        usuarioId: session.user.id,
        acao: `ATRIBUIR_AUTOR: ${newAuthorId}`,
        artigoId,
      },
    }),
  ]);

  revalidatePath("/erp/artigos/kanban");
  return { ok: true };
}

export async function getArticleVersions(artigoId: string) {
  await exigirAlgumaPermissao(["artigos:ler", "artigos:editar", "artigos:publicar"]);

  const versions = await prisma.versaoArtigo.findMany({
    where: { artigoId },
    orderBy: { criadoEm: "desc" },
  });

  return JSON.parse(JSON.stringify(versions));
}
