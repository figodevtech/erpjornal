"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";

import { exigirAlgumaPermissao, exigirPermissao, obterSessao, temAlgumaPermissao, temPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sanitizarHtmlArtigo } from "@/lib/html/sanitize";
import { lerTags } from "@/lib/slug";
import { registrarAuditoria } from "@/lib/auditoria";
import { MENSAGEM_CHECAGEM_OBRIGATORIA, categoriaExigeChecagem } from "@/lib/editorial/checagem";
import {
  motivoBloqueioExclusao,
  motivoBloqueioMudancaStatus,
  podeEditarArtigo,
} from "@/lib/editorial/permissoes-artigo";
import {
  afetaPortal,
  isStatusArtigo,
  resolverStatusAoSalvar,
  type StatusArtigo,
} from "@/lib/editorial/status";
import { lerDataHoraLocal } from "@/lib/datas";
import { revalidarMateriasNoPortal } from "@/lib/cache/portal";
import { agendarDisparoNewsletter } from "@/lib/newsletter/disparo";

/** Campos do artigo que vão para a auditoria (sem o corpo, que é grande). */
function resumoParaAuditoria(artigo: {
  titulo: string;
  slug: string;
  status: string;
  categoriaId?: string | null;
  dataPublicacao?: Date | null;
  ehPremium?: boolean;
}) {
  return {
    titulo: artigo.titulo,
    slug: artigo.slug,
    status: artigo.status,
    categoriaId: artigo.categoriaId ?? null,
    dataPublicacao: artigo.dataPublicacao ?? null,
    ehPremium: artigo.ehPremium,
  };
}

/** O campo datetime-local chega sem fuso: é horário de Brasília (o servidor roda em UTC). */
function lerDataPublicacao(valor: FormDataEntryValue | null): Date | null {
  return typeof valor === "string" ? lerDataHoraLocal(valor) : null;
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

/** Substitui as tags da matéria, criando as que ainda não existem. */
async function definirTags(
  tx: Pick<typeof prisma, "tag" | "artigoTag">,
  artigoId: string,
  tags: { nome: string; slug: string }[]
) {
  await tx.artigoTag.deleteMany({ where: { artigoId } });
  const ids: string[] = [];
  for (const { nome, slug } of tags) {
    const tag = await tx.tag.upsert({ where: { slug }, update: {}, create: { nome, slug }, select: { id: true } });
    ids.push(tag.id);
  }
  if (ids.length > 0) {
    await tx.artigoTag.createMany({ data: ids.map((tagId) => ({ artigoId, tagId })), skipDuplicates: true });
  }
}

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
  const dataSolicitada = lerDataPublicacao(formData.get("dataPublicacao"));
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

  const tags = lerTags(texto(formData, "tags"));
  const politicoIds = campos.data.politicoIds;
  const entidadesRelacionadas = politicoIds.map((politicoId) => ({
    politicoId,
    papel: ((formData.get(`entidadePapel_${politicoId}`) as string) || "").trim() || null,
  }));
  let previousRevistaId: string | null = null;
  // Para decidir o que invalidar no portal depois de salvar.
  let statusAnterior: StatusArtigo | null = null;
  let statusFinal: StatusArtigo = "pauta";
  let slugAnterior: string | null = null;

  const slugEmUso = await prisma.artigo.findFirst({
    // excluidoEm: undefined inclui artigos excluídos: o slug deles continua reservado (único no banco).
    where: { slug, excluidoEm: undefined, ...(id ? { NOT: { id } } : {}) },
    select: { id: true },
  });
  if (slugEmUso) {
    return { ok: false, error: "Já existe outra matéria com este slug. Ajuste o slug e salve de novo." };
  }

  if (id) {
    // Retorno (e não throw): o Next esconde a mensagem de erros lançados em produção.
    if (!podeEditar && !podePublicar) {
      return { ok: false, error: "Você não tem permissão para editar este artigo." };
    }

    const existing = await prisma.artigo.findUnique({
      where: { id },
      include: { tags: { select: { tag: { select: { nome: true } } } } },
    });
    if (!existing) return { ok: false, error: "Artigo não encontrado. Ele pode ter sido excluído." };
    previousRevistaId = existing.revistaId;

    if (!podeEditarArtigo(session, existing)) {
      return { ok: false, error: "Você não tem permissão para editar este artigo." };
    }

    const finalStatus = resolverStatusAoSalvar({
      solicitado: statusSolicitado,
      atual: existing.status,
      podePublicar,
    });
    statusAnterior = existing.status;
    statusFinal = finalStatus;
    slugAnterior = existing.slug;
    const finalPublishDate =
      finalStatus === "publicado"
        ? dataPublicacaoPermitida ?? existing.dataPublicacao ?? new Date()
        : null;

    const revistaId = existing.revistaId;
    const ordemNaRevista = revistaId ? existing.ordemNaRevista : null;
    const estavaPublicado = existing.status === "publicado";

    // Slug de matéria publicada é a URL pública: só quem publica muda, e o antigo vira 301.
    const slugMudou = existing.slug !== slug;
    if (slugMudou && estavaPublicado && !podePublicar) {
      return { ok: false, error: "O endereço (slug) de uma matéria publicada só pode ser alterado por quem publica." };
    }

    if (finalStatus === "publicado" && factChecks.length === 0 && (await categoriaExigeChecagem(data.categoriaId))) {
      return { ok: false, error: MENSAGEM_CHECAGEM_OBRIGATORIA };
    }

    await prisma.$transaction(async (tx) => {
      // Versionamento (PRD): toda edição de matéria publicada guarda a versão anterior.
      if (estavaPublicado) {
        await tx.versaoArtigo.create({
          data: {
            artigoId: id,
            titulo: existing.titulo,
            resumo: existing.resumo,
            corpoTexto: existing.corpoTexto,
            status: existing.status,
            usuarioId: session.user.id,
            resumoMudancas: "Versão anterior a uma edição da matéria publicada",
          },
        });
      }

      if (slugMudou) {
        // O novo slug pode ter sido um endereço antigo; o antigo passa a redirecionar.
        await tx.redirecionamentoSlug.deleteMany({ where: { slugAntigo: slug } });
        if (estavaPublicado) {
          await tx.redirecionamentoSlug.upsert({
            where: { slugAntigo: existing.slug },
            update: { artigoId: id },
            create: { slugAntigo: existing.slug, artigoId: id },
          });
        }
      }

      await tx.artigo.update({
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

      await definirTags(tx, id, tags);

      await registrarAuditoria(
        {
          usuarioId: session.user.id,
          acao: finalStatus === "publicado" && !estavaPublicado ? "PUBLICACAO" : "EDICAO",
          entidade: "artigo",
          artigoId: id,
          antes: { ...resumoParaAuditoria(existing), tags: existing.tags.map(({ tag }) => tag.nome).sort() },
          depois: {
            ...resumoParaAuditoria({ ...data, slug, status: finalStatus, dataPublicacao: finalPublishDate }),
            tags: tags.map(({ nome }) => nome).sort(),
          },
        },
        tx
      );
    });
  } else {
    const finalStatus = resolverStatusAoSalvar({
      solicitado: statusSolicitado,
      atual: null,
      podePublicar,
    });
    statusFinal = finalStatus;
    const revistaId = requestedRevistaId;
    const ordemNaRevista = revistaId ? (await prisma.artigo.count({ where: { revistaId } })) + 1 : null;

    if (finalStatus === "publicado" && factChecks.length === 0 && (await categoriaExigeChecagem(data.categoriaId))) {
      return { ok: false, error: MENSAGEM_CHECAGEM_OBRIGATORIA };
    }

    await prisma.$transaction(async (tx) => {
      // Um endereço antigo (redirecionamento) que passa a ser usado deixa de redirecionar.
      await tx.redirecionamentoSlug.deleteMany({ where: { slugAntigo: slug } });

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

      await definirTags(tx, novoArtigo.id, tags);

      await registrarAuditoria(
        {
          usuarioId: session.user.id,
          acao: finalStatus === "publicado" ? "CRIACAO_E_PUBLICACAO" : "CRIACAO",
          entidade: "artigo",
          artigoId: novoArtigo.id,
          depois: { ...resumoParaAuditoria(novoArtigo), tags: tags.map(({ nome }) => nome).sort() },
        },
        tx
      );
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
  // Rascunho que nunca esteve no ar não muda nada no portal: não invalida o cache.
  if (afetaPortal(statusAnterior, statusFinal)) {
    revalidarMateriasNoPortal([slug, slugAnterior]);
  }
  // Matéria no ar com o canal "newsletter": envia depois da resposta (só uma vez por matéria).
  if (statusFinal === "publicado") agendarDisparoNewsletter();
  redirect(finalRevistaId ? `/erp/revistas/${finalRevistaId}` : "/erp/artigos");
}

const RascunhoAutomatico = z.object({
  id: z.uuid(),
  titulo: z.string().trim().min(1, "Informe o título.").max(300, "O título pode ter no máximo 300 caracteres."),
  resumo: z.string().trim().max(1000, "O resumo pode ter no máximo 1000 caracteres."),
  corpoTexto: z.string().max(1_000_000, "O texto ficou grande demais para o salvamento automático."),
});

/** Intervalo mínimo entre dois registros de salvamento automático do mesmo artigo na auditoria. */
const INTERVALO_AUDITORIA_RASCUNHO_MS = 15 * 60 * 1000;

export type ResultadoRascunho =
  | { ok: true; salvoEm: string }
  /** `parar`: o salvamento automático não vai funcionar nesta tela (sessão, permissão ou etapa). */
  | { ok: false; error: string; parar?: boolean };

/**
 * Salvamento automático do editor (a cada 30s): grava só título, resumo e corpo
 * de matérias ainda não publicadas. Etapa, slug, checagens e vínculos continuam
 * exigindo o botão Salvar. Nunca redireciona (rodaria no meio da digitação).
 */
export async function salvarRascunhoAutomatico(entrada: unknown): Promise<ResultadoRascunho> {
  const sessao = await obterSessao();
  if (!sessao || sessao.user.status !== "ativo") {
    return { ok: false, parar: true, error: "Sua sessão expirou. Copie o texto e entre de novo antes de salvar." };
  }
  if (!temAlgumaPermissao(sessao, ["artigos:editar", "artigos:publicar"])) {
    return { ok: false, parar: true, error: "Você não tem permissão para editar artigos." };
  }

  const dados = RascunhoAutomatico.safeParse(entrada);
  if (!dados.success) {
    return { ok: false, error: dados.error.issues[0]?.message ?? "Dados do rascunho inválidos." };
  }
  const { id, titulo, resumo } = dados.data;
  const corpoTexto = sanitizarHtmlArtigo(dados.data.corpoTexto);
  if (!corpoTexto) {
    return { ok: false, error: "O corpo da matéria está vazio; o rascunho não foi salvo." };
  }

  const existente = await prisma.artigo.findUnique({
    where: { id },
    select: { autorId: true, status: true, titulo: true, resumo: true },
  });
  if (!existente) {
    return { ok: false, parar: true, error: "Matéria não encontrada." };
  }
  if (!podeEditarArtigo(sessao, existente)) {
    return { ok: false, parar: true, error: "Você não tem permissão para editar esta matéria." };
  }
  if (existente.status === "publicado" || existente.status === "arquivado") {
    return { ok: false, parar: true, error: "Matérias publicadas ou arquivadas não têm salvamento automático. Use Salvar." };
  }

  await prisma.artigo.update({ where: { id }, data: { titulo, resumo, corpoTexto } });

  // Um registro por janela de 15 minutos: o salvamento a cada 30s não inunda a trilha.
  const registroRecente = await prisma.logAuditoria.findFirst({
    where: {
      entidade: "artigo",
      entidadeId: id,
      usuarioId: sessao.user.id,
      acao: "SALVAMENTO_AUTOMATICO",
      criadoEm: { gte: new Date(Date.now() - INTERVALO_AUDITORIA_RASCUNHO_MS) },
    },
    select: { id: true },
  });
  if (!registroRecente) {
    await registrarAuditoria({
      usuarioId: sessao.user.id,
      acao: "SALVAMENTO_AUTOMATICO",
      entidade: "artigo",
      artigoId: id,
      antes: { titulo: existente.titulo, resumo: existente.resumo },
      depois: { titulo, resumo },
    });
  }

  return { ok: true, salvoEm: new Date().toISOString() };
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
      slug: true,
      resumo: true,
      corpoTexto: true,
      categoriaId: true,
      dataPublicacao: true,
      _count: { select: { checagensFato: true } },
    },
  });

  if (!artigo) return { ok: false, error: "Artigo não encontrado." };
  if (artigo.status === newStatus) return { ok: true };

  // Autor ou editar_todos; publicar/despublicar/arquivar exige artigos:publicar.
  const bloqueio = motivoBloqueioMudancaStatus(session, artigo, newStatus);
  if (bloqueio) return { ok: false, error: bloqueio };

  if (
    newStatus === "publicado" &&
    artigo._count.checagensFato === 0 &&
    (await categoriaExigeChecagem(artigo.categoriaId))
  ) {
    return { ok: false, error: MENSAGEM_CHECAGEM_OBRIGATORIA };
  }

  const dataPublicacao = newStatus === "publicado" ? artigo.dataPublicacao || new Date() : null;

  await prisma.$transaction(async (tx) => {
    await tx.versaoArtigo.create({
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
    await tx.artigo.update({
      where: { id },
      data: { status: newStatus, dataPublicacao },
    });
    await registrarAuditoria(
      {
        usuarioId: session.user.id,
        acao: "MUDANCA_STATUS",
        entidade: "artigo",
        artigoId: id,
        antes: { status: artigo.status, dataPublicacao: artigo.dataPublicacao },
        depois: { status: newStatus, dataPublicacao },
      },
      tx
    );
  });

  revalidatePath("/erp/artigos");
  revalidatePath("/erp/artigos/kanban");
  if (afetaPortal(artigo.status, newStatus)) revalidarMateriasNoPortal([artigo.slug]);
  if (newStatus === "publicado") agendarDisparoNewsletter();
  return { ok: true };
}

/** Exclusão lógica (PRD: nada é apagado fisicamente). O slug continua reservado. */
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
      categoriaId: true,
      dataPublicacao: true,
    },
  });

  if (!artigo) {
    return { ok: false, error: "Artigo não encontrado." };
  }

  // Quem pode editar; artigo publicado exige também artigos:publicar.
  const bloqueio = motivoBloqueioExclusao(session, artigo);
  if (bloqueio) return { ok: false, error: bloqueio };

  await prisma.$transaction(async (tx) => {
    await tx.artigo.update({ where: { id }, data: { excluidoEm: new Date() } });
    await registrarAuditoria(
      {
        usuarioId: session.user.id,
        acao: "EXCLUSAO",
        entidade: "artigo",
        artigoId: id,
        antes: resumoParaAuditoria(artigo),
      },
      tx
    );
  });

  revalidatePath("/erp/artigos");
  revalidatePath("/erp/artigos/kanban");
  if (artigo.revistaId) {
    revalidatePath(`/erp/revistas/${artigo.revistaId}`);
  }
  if (afetaPortal(artigo.status, null)) revalidarMateriasNoPortal([artigo.slug]);

  return { ok: true, revistaId: artigo.revistaId };
}

/** Atribui outro autor ao artigo (ação de editor: exige artigos:editar_todos). */
export async function updateArticleAuthor(artigoId: string, newAuthorId: string): Promise<ResultadoAcao> {
  const session = await exigirPermissao("artigos:editar_todos");

  const [novoAutor, artigo] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: newAuthorId }, select: { id: true, status: true } }),
    prisma.artigo.findUnique({ where: { id: artigoId }, select: { autorId: true, status: true, slug: true } }),
  ]);
  if (!novoAutor || novoAutor.status !== "ativo") {
    return { ok: false, error: "Autor inválido ou inativo." };
  }
  if (!artigo) return { ok: false, error: "Artigo não encontrado." };

  await prisma.$transaction(async (tx) => {
    await tx.artigo.update({ where: { id: artigoId }, data: { autorId: newAuthorId } });
    await registrarAuditoria(
      {
        usuarioId: session.user.id,
        acao: "TROCA_AUTOR",
        entidade: "artigo",
        artigoId,
        antes: { autorId: artigo.autorId },
        depois: { autorId: newAuthorId },
      },
      tx
    );
  });

  revalidatePath("/erp/artigos/kanban");
  // O nome do autor aparece na página da matéria publicada.
  if (afetaPortal(artigo.status, artigo.status)) revalidarMateriasNoPortal([artigo.slug]);
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
