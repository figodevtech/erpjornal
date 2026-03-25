"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function saveArticle(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado");

  const id = formData.get("id") as string | null;
  const titulo = formData.get("titulo") as string;
  const slug = formData.get("slug") as string;
  const resumo = formData.get("resumo") as string;
  const corpo_texto = formData.get("corpo_texto") as string;
  const categoria_id = formData.get("categoria_id") as string;
  const status_id = formData.get("status_id") as string;
  const legal_notes = formData.get("legal_notes") as string || null;
  const legal_status = formData.get("legal_status") as string || "pendente";
  const rawDate = formData.get("data_publicacao") as string;

  if (!titulo || !slug || !corpo_texto) {
    throw new Error("Campos obrigatórios ausentes");
  }

  const role = session.user.role;
  let finalStatus = status_id;

  // RBAC no Backend: Reporter só salva rascunho ou manda pra revisão.
  if (status_id === "publicado" && role !== "admin" && role !== "editor") {
    finalStatus = "em_revisao";
  }

  let data_publicacao = finalStatus === "publicado" ? new Date() : null;
  if (finalStatus === "publicado" && rawDate) {
    const parsedDate = new Date(rawDate);
    if (!isNaN(parsedDate.getTime())) {
      data_publicacao = parsedDate;
    }
  }

  const regiao = formData.get("regiao") as string || "Nacional";
  const estadoRaw = formData.get("estado") as string || "";
  const estado = estadoRaw.toUpperCase().slice(0, 2) || null;

  const data = {
    titulo,
    slug,
    resumo,
    corpo_texto,
    status_id: finalStatus,
    categoria_id: categoria_id || null,
    legal_notes,
    legal_status,
    data_publicacao,
    regiao,
    estado,
  };

  const factChecksCount = parseInt(formData.get("fact_checks_count") as string || "0");
  const factChecks = [];
  for (let i = 0; i < factChecksCount; i++) {
    const fonte_url = formData.get(`fact_check_url_${i}`) as string;
    const documento_url = formData.get(`fact_check_doc_${i}`) as string;
    const status_verificacao = formData.get(`fact_check_status_${i}`) as string;
    if (fonte_url || documento_url) {
      factChecks.push({ fonte_url, documento_url, status_verificacao });
    }
  }

  const politicoIds = formData.getAll("politico_ids") as string[];

  if (id) {
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) throw new Error("Artigo não encontrado");
    
    // Validando edição: Repórter não pode alterar artigo alheio
    if (role === "reporter" && existing.autor_id !== session.user.id) {
      throw new Error("Você não tem permissão para editar este artigo.");
    }
    
    await prisma.article.update({
      where: { id },
      data: {
        ...data,
        data_publicacao: data_publicacao || existing.data_publicacao,
        fact_checks: {
          deleteMany: {},
          create: factChecks
        },
        politicos: {
          set: politicoIds.map(pid => ({ id: pid }))
        }
      }
    });

    await prisma.actionLog.create({
      data: {
        user_id: session.user.id,
        acao: finalStatus === "publicado" && existing.status_id !== "publicado" ? "PUBLICACAO" : "EDICAO",
        article_id: id,
      }
    });
  } else {
    const novoArtigo = await prisma.article.create({
      data: {
        ...data,
        autor_id: session.user.id,
        fact_checks: {
          create: factChecks
        },
        politicos: {
          connect: politicoIds.map(pid => ({ id: pid }))
        }
      }
    });

    await prisma.actionLog.create({
      data: {
        user_id: session.user.id,
        acao: finalStatus === "publicado" ? "CRIACAO_E_PUBLICACAO" : "CRIACAO",
        article_id: novoArtigo.id,
      }
    });
  }

  revalidatePath("/erp/artigos");
  redirect("/erp/artigos");
}

export async function updateArticleStatus(id: string, newStatus: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado");

  const article = await prisma.article.findUnique({
    where: { id },
    select: { 
      status_id: true, 
      autor_id: true,
      titulo: true,
      resumo: true,
      corpo_texto: true
    }
  });

  if (!article) throw new Error("Artigo não encontrado");

  // RBAC Básico: Repórter não pode mover para "publicado"
  const role = session.user.role;
  if (newStatus === "publicado" && role !== "admin" && role !== "editor") {
    throw new Error("Você não tem permissão para publicar.");
  }

  // Salvar snapshot da versão atual antes de mudar o status (Versionamento M2-PLUS-T2)
  await prisma.articleVersion.create({
    data: {
      article_id: id,
      titulo: article.titulo,
      resumo: article.resumo,
      corpo_texto: article.corpo_texto,
      status_id: article.status_id,
      user_id: session.user.id,
      mudancas_resumo: `Mudança de status via Kanban para: ${newStatus}`,
    }
  });

  await prisma.article.update({
    where: { id },
    data: { 
      status_id: newStatus,
      data_publicacao: newStatus === "publicado" ? new Date() : null
    }
  });

  await prisma.actionLog.create({
    data: {
      user_id: session.user.id,
      acao: `MOVER_KANBAN: ${article.status_id} -> ${newStatus}`,
      article_id: id,
    }
  });

  revalidatePath("/erp/artigos");
  revalidatePath("/erp/artigos/kanban");
}

export async function updateArticleAuthor(articleId: string, newAuthorId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado");

  const role = session.user.role;
  if (role !== "admin" && role !== "editor") {
    throw new Error("Apenas editores ou administradores podem atribuir pautas.");
  }

  await prisma.article.update({
    where: { id: articleId },
    data: { autor_id: newAuthorId }
  });

  await prisma.actionLog.create({
    data: {
      user_id: session.user.id,
      acao: `ATRIBUIR_AUTOR: ${newAuthorId}`,
      article_id: articleId,
    }
  });

  revalidatePath("/erp/artigos/kanban");
}

export async function getArticleVersions(articleId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado");

  const versions = await prisma.articleVersion.findMany({
    where: { article_id: articleId },
    orderBy: { created_at: "desc" }
  });

  return JSON.parse(JSON.stringify(versions));
}
