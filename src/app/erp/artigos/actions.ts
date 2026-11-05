"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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

// Links e imagens viram href/src no portal: só http(s) (nada de javascript:).
const UrlHttpOpcional = z.union([z.literal(""), z.url({ protocol: /^https?$/, message: "Use um link http(s) válido." })]);
const UuidOpcional = z.union([z.literal(""), z.uuid()]);

const CamposArtigo = z.object({
  id: UuidOpcional,
  titulo: z.string().trim().min(1, "Informe o título.").max(300, "O título pode ter no máximo 300 caracteres."),
  slug: z
    .string()
    .trim()
    .min(1, "Informe o slug.")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "O slug deve ter só letras minúsculas, números e hífens."),
  resumo: z.string().trim().max(1000, "O resumo pode ter no máximo 1000 caracteres."),
  categoriaId: UuidOpcional,
  revistaId: UuidOpcional,
  urlFonte: UrlHttpOpcional,
  urlImagemOg: UrlHttpOpcional,
  autorExterno: z.string().trim().max(120),
  canaisPublicacao: z.array(z.enum(["portal", "newsletter", "redes_sociais"])).max(3),
  politicoIds: z.array(z.uuid()).max(50),
});

const ChecagemFato = z.object({
  urlFonte: UrlHttpOpcional,
  urlDocumento: UrlHttpOpcional,
  statusVerificacao: z.string().trim().max(30).catch("verificado"),
});

function texto(formData: FormData, campo: string) {
  return formData.get(campo)?.toString() ?? "";
}

export async function saveArticle(formData: FormData): Promise<{ ok: false; error: string } | void> {
  const campos = CamposArtigo.safeParse({
    id: texto(formData, "id"),
    titulo: texto(formData, "titulo"),
    slug: texto(formData, "slug"),
    resumo: texto(formData, "resumo"),
    categoriaId: texto(formData, "categoriaId"),
    revistaId: texto(formData, "revistaId"),
    urlFonte: texto(formData, "urlFonte").trim(),
    urlImagemOg: texto(formData, "urlImagemOg").trim(),
    autorExterno: texto(formData, "autorExterno"),
    canaisPublicacao: formData.getAll("canaisPublicacao").map(String),
    politicoIds: formData.getAll("politicoIds").map(String),
  });

  const id = campos.success ? campos.data.id || null : null;
  const session = id
    ? await exigirAlgumaPermissao(["artigos:editar", "artigos:publicar"])
    : await exigirPermissao("artigos:criar");

  if (!campos.success) {
    return { ok: false, error: campos.error.issues[0]?.message ?? "Dados do artigo inválidos." };
  }

  const { titulo, slug, resumo, categoriaId, canaisPublicacao, autorExterno: autorExternoBruto } = campos.data;
  // Barreira contra XSS: todo HTML de matéria é sanitizado antes de ir para o banco.
  const corpoTexto = sanitizarHtmlArtigo(texto(formData, "corpoTexto"));
  const statusSolicitado = formData.get("status");
  const dataSolicitada = lerDataPublicacao(formData.get("dataPublicacao") as string | null);
  const urlFonte = campos.data.urlFonte || null;
  const autorExterno = autorExternoBruto || null;
  const requestedRevistaId = campos.data.revistaId || null;
  const urlImagemOg = campos.data.urlImagemOg || null;

  if (!corpoTexto) {
    return { ok: false, error: "O corpo da matéria está vazio." };
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

  const factChecksCount = Math.min(50, Math.max(0, Number.parseInt(texto(formData, "checagensFato_count"), 10) || 0));
  const factChecks: { urlFonte: string | null; urlDocumento: string | null; statusVerificacao: string }[] = [];
  for (let i = 0; i < factChecksCount; i++) {
    const checagem = ChecagemFato.safeParse({
      urlFonte: texto(formData, `fact_check_url_${i}`).trim(),
      urlDocumento: texto(formData, `fact_check_doc_${i}`).trim(),
      statusVerificacao: texto(formData, `fact_check_status_${i}`),
    });
    if (!checagem.success) {
      return { ok: false, error: `Checagem de fato ${i + 1}: ${checagem.error.issues[0]?.message}` };
    }
    const { urlFonte: urlChecagem, urlDocumento, statusVerificacao } = checagem.data;
    if (urlChecagem || urlDocumento) {
      factChecks.push({ urlFonte: urlChecagem || null, urlDocumento: urlDocumento || null, statusVerificacao });
    }
  }

  const politicoIds = campos.data.politicoIds;
  const entidadesRelacionadas = politicoIds.map((politicoId) => ({
    politicoId,
    papel: ((formData.get(`entidadePapel_${politicoId}`) as string) || "").trim() || null,
  }));
  let previousRevistaId: string | null = null;

  const slugEmUso = await prisma.artigo.findFirst({
    where: { slug, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (slugEmUso) {
    return { ok: false, error: "Já existe outra matéria com este slug. Ajuste o slug e salve de novo." };
  }

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

    // Artigo e log de auditoria juntos: nunca fica uma edição sem registro (ou vice-versa).
    await prisma.$transaction([
      prisma.artigo.update({
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
      }),
      prisma.logAcao.create({
        data: {
          usuarioId: session.user.id,
          acao:
            finalStatus === "publicado" && existing.status !== "publicado"
              ? "PUBLICACAO"
              : "EDICAO",
          artigoId: id,
        },
      }),
    ]);
  } else {
    const finalStatus = resolverStatusAoSalvar({
      solicitado: statusSolicitado,
      atual: null,
      podePublicar,
    });
    const revistaId = requestedRevistaId;
    const ordemNaRevista = revistaId ? (await prisma.artigo.count({ where: { revistaId } })) + 1 : null;

    await prisma.$transaction(async (tx) => {
      const novoArtigo = await tx.artigo.create({
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

      await tx.logAcao.create({
        data: {
          usuarioId: session.user.id,
          acao: finalStatus === "publicado" ? "CRIACAO_E_PUBLICACAO" : "CRIACAO",
          artigoId: novoArtigo.id,
        },
      });
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
