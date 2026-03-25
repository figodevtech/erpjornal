"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function savePodcast(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado");

  const id = formData.get("id") as string | null;
  const titulo = formData.get("titulo") as string;
  const slug = formData.get("slug") as string;
  const descricao = formData.get("descricao") as string || null;
  const audio_url = formData.get("audio_url") as string;
  const capa_url = formData.get("capa_url") as string || null;
  const duracaoRaw = formData.get("duracao") as string;
  const duracao = duracaoRaw ? parseInt(duracaoRaw) : null;
  const status = formData.get("status") as string || "draft";
  const tagsRaw = formData.get("tags") as string;
  const tags = tagsRaw ? tagsRaw.split(",").map(t => t.trim()) : [];

  if (!titulo || !slug || !audio_url) throw new Error("Campos obrigatórios ausentes");

  const data = {
    titulo,
    slug,
    descricao,
    audio_url,
    capa_url,
    duracao,
    status,
    tags,
  };

  if (id) {
    await (prisma as any).podcastEpisode.update({ where: { id }, data });
  } else {
    await (prisma as any).podcastEpisode.create({ data });
  }

  revalidatePath("/erp/podcasts");
  revalidatePath("/podcasts");
  redirect("/erp/podcasts");
}
