"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { exigirPermissao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { criarClienteSupabaseAdmin } from "@/lib/supabase/admin";

const REVISTA_COVERS_BUCKET = process.env.SUPABASE_REVISTA_COVERS_BUCKET || "revista-covers";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

function extensionFromMimeType(mimeType: string) {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  return "jpg";
}

async function ensureRevistaCoversBucket() {
  const supabase = criarClienteSupabaseAdmin();
  const { data: bucket } = await supabase.storage.getBucket(REVISTA_COVERS_BUCKET);

  if (!bucket) {
    const { error } = await supabase.storage.createBucket(REVISTA_COVERS_BUCKET, {
      public: true,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      fileSizeLimit: 20 * 1024 * 1024,
    });

    if (error) {
      throw new Error(`Nao foi possivel criar o bucket de capas de revistas: ${error.message}`);
    }
  }

  return supabase;
}

export async function saveRevista(formData: FormData) {
  const id = formData.get("id") as string | null;
  await (id ? exigirPermissao("revistas:editar") : exigirPermissao("revistas:criar"));

  const titulo = (formData.get("titulo") as string)?.trim();
  const descricao = ((formData.get("descricao") as string) || "").trim() || null;
  const edicao = (formData.get("edicao") as string)?.trim();
  const dataPublicacaoRaw = formData.get("dataPublicacao") as string;

  if (!titulo || !edicao) {
    throw new Error("Título e edição são obrigatórios.");
  }

  const dataPublicacao = dataPublicacaoRaw ? new Date(dataPublicacaoRaw) : null;
  const data = {
    titulo,
    descricao,
    edicao,
    dataPublicacao: dataPublicacao && !Number.isNaN(dataPublicacao.getTime()) ? dataPublicacao : null,
  };

  const revista = id
    ? await prisma.revista.update({ where: { id }, data })
    : await prisma.revista.create({ data });

  revalidatePath("/erp/revistas");
  revalidatePath(`/erp/revistas/${revista.id}`);
  revalidatePath("/");
  revalidatePath(`/revistas/${revista.id}`);
  redirect(`/erp/revistas/${revista.id}`);
}

export async function updateRevistaCover(formData: FormData) {
  await exigirPermissao("revistas:editar");

  const revistaId = formData.get("revistaId") as string;
  const file = formData.get("file");

  if (!revistaId) {
    throw new Error("Revista nao informada.");
  }

  if (!(file instanceof File)) {
    throw new Error("Selecione uma imagem de capa.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("O arquivo precisa ser uma imagem.");
  }

  const revista = await prisma.revista.findUnique({
    where: { id: revistaId },
    select: { id: true, titulo: true },
  });

  if (!revista) {
    throw new Error("Revista nao encontrada.");
  }

  const supabase = await ensureRevistaCoversBucket();
  const ext = extensionFromMimeType(file.type);
  const path = `covers/${slugify(revista.titulo) || "revista"}-${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from(REVISTA_COVERS_BUCKET).upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`Nao foi possivel enviar a capa: ${error.message}`);
  }

  const { data } = supabase.storage.from(REVISTA_COVERS_BUCKET).getPublicUrl(path);

  await prisma.revista.update({
    where: { id: revistaId },
    data: { capaUrl: data.publicUrl },
  });

  revalidatePath("/erp/revistas");
  revalidatePath(`/erp/revistas/${revistaId}`);
  revalidatePath("/");
  revalidatePath(`/revistas/${revistaId}`);

  return { url: data.publicUrl };
}

export async function updateRevistaArticleOrder(revistaId: string, articleIds: string[]) {
  await exigirPermissao("revistas:editar");

  if (!revistaId || articleIds.length === 0) {
    return;
  }

  const count = await prisma.artigo.count({
    where: {
      revistaId,
      id: { in: articleIds },
    },
  });

  if (count !== articleIds.length) {
    throw new Error("A lista contém artigos que não pertencem a esta revista.");
  }

  await prisma.$transaction(
    articleIds.map((id, index) =>
      prisma.artigo.update({
        where: { id },
        data: { ordemNaRevista: index + 1 },
      })
    )
  );

  revalidatePath(`/erp/revistas/${revistaId}`);
}

export async function deleteRevista(id: string) {
  await exigirPermissao("revistas:editar");

  await prisma.$transaction([
    prisma.artigo.updateMany({
      where: { revistaId: id },
      data: {
        revistaId: null,
        ordemNaRevista: null,
      },
    }),
    prisma.revista.delete({ where: { id } }),
  ]);

  revalidatePath("/erp/revistas");
  revalidatePath("/");
  revalidatePath(`/revistas/${id}`);
}
