"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirPermissao, obterSessao } from "@/lib/auth";
import { MediaKitStatus, Prisma } from "@prisma/client";
import { MediaKitTheme, MediaKitSectionWithData } from "@/types/media-kit";
import { toMediaKitSectionWithData } from "./section-mappers";

/**
 * Cria um novo Mídia Kit vazio.
 */
export async function createMediaKit(formData: FormData) {
  await exigirPermissao("midia-kit:criar");

  const nome = (formData.get("nome") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();

  if (!nome || !slug) {
    throw new Error("Nome e slug são obrigatórios.");
  }

  // Verifica se o slug já existe
  const slugExistente = await prisma.mediaKit.findUnique({
    where: { slug }
  });

  if (slugExistente) {
    throw new Error("Este slug já está em uso.");
  }

  const mediaKit = await prisma.mediaKit.create({
    data: {
      nome,
      slug,
      status: "DRAFT",
      tema: {
        primaryColor: "#000000",
        secondaryColor: "#ffffff",
        backgroundColor: "#ffffff",
        textColor: "#000000",
      },
    },
  });

  revalidatePath("/erp/midia-kit");
  redirect(`/erp/midia-kit/${mediaKit.id}/editor`);
}

/**
 * Atualiza metadados do Mídia Kit (nome, slug, tema, status).
 */
export async function updateMediaKit(id: string, data: { 
  nome?: string; 
  slug?: string; 
  tema?: MediaKitTheme; 
  status?: MediaKitStatus;
}) {
  await exigirPermissao("midia-kit:editar");

  const mediaKit = await prisma.mediaKit.update({
    where: { id },
    data: {
      ...data,
      tema: data.tema ? (data.tema as unknown as Prisma.InputJsonValue) : undefined,
    },
  });

  revalidatePath("/erp/midia-kit");
  revalidatePath(`/erp/midia-kit/${id}`);
  
  if (mediaKit.status === "PUBLISHED") {
    revalidatePath(`/midia-kit/${mediaKit.slug}`);
  }

  return mediaKit;
}

/**
 * Deleta um Mídia Kit e todas as suas dependências.
 */
export async function deleteMediaKit(id: string) {
  await exigirPermissao("midia-kit:editar");

  const mediaKit = await prisma.mediaKit.findUnique({
    where: { id },
    select: { slug: true }
  });

  await prisma.mediaKit.delete({
    where: { id },
  });

  revalidatePath("/erp/midia-kit");
  if (mediaKit) {
    revalidatePath(`/midia-kit/${mediaKit.slug}`);
  }

  redirect("/erp/midia-kit");
}

/**
 * Salva ou atualiza as seções de um Mídia Kit em lote.
 */
export async function saveMediaKitSections(
  mediaKitId: string,
  sections: Partial<MediaKitSectionWithData>[]
): Promise<MediaKitSectionWithData[]> {
  await exigirPermissao("midia-kit:editar");

  const sectionsToKeep = sections.filter(s => s.id && !s.id.startsWith("temp-")).map(s => s.id);

  await prisma.$transaction(async (tx) => {
    await tx.mediaKitSection.deleteMany({
      where: {
        mediaKitId,
        id: { notIn: sectionsToKeep as string[] }
      }
    });

    for (const section of sections) {
      if (section.id && !section.id.startsWith("temp-")) {
        await tx.mediaKitSection.update({
          where: { id: section.id },
          data: {
            tipo: section.tipo,
            titulo: section.titulo,
            ordem: section.ordem,
            ativo: section.ativo,
            data: section.data as Prisma.InputJsonValue,
          },
        });
      } else {
        await tx.mediaKitSection.create({
          data: {
            mediaKitId,
            tipo: section.tipo!,
            titulo: section.titulo,
            ordem: section.ordem!,
            ativo: section.ativo ?? true,
            data: section.data as Prisma.InputJsonValue,
          },
        });
      }
    }
  });

  revalidatePath(`/erp/midia-kit/${mediaKitId}/editor`);
  
  const updated = await prisma.mediaKitSection.findMany({
    where: { mediaKitId },
    orderBy: { ordem: 'asc' }
  });
  return updated.map(toMediaKitSectionWithData);
}

/**
 * Atualiza apenas a ordem das seções (Dnd-kit integration).
 */
export async function updateSectionOrder(mediaKitId: string, sectionOrders: { id: string; ordem: number }[]) {
  await exigirPermissao("midia-kit:editar");

  await prisma.$transaction(
    sectionOrders.map((item) =>
      prisma.mediaKitSection.update({
        where: { id: item.id },
        data: { ordem: item.ordem },
      })
    )
  );

  revalidatePath(`/erp/midia-kit/${mediaKitId}/editor`);
}

/**
 * Publica um Mídia Kit (Gera snapshot/versão).
 */
export async function publishMediaKit(id: string) {
  await exigirPermissao("midia-kit:publicar");
  const sessao = await obterSessao();

  const mediaKit = await prisma.mediaKit.findUnique({
    where: { id },
    include: {
      secoes: {
        orderBy: { ordem: "asc" }
      }
    }
  });

  if (!mediaKit) throw new Error("Mídia Kit não encontrado.");

  // Cria o snapshot
  const snapshot = {
    nome: mediaKit.nome,
    tema: mediaKit.tema,
    idioma: mediaKit.idioma,
    secoes: mediaKit.secoes.map(s => ({
      tipo: s.tipo,
      titulo: s.titulo,
      ordem: s.ordem,
      data: s.data
    }))
  };

  await prisma.$transaction([
    // Cria a versão
    prisma.mediaKitVersion.create({
      data: {
        mediaKitId: id,
        snapshot: snapshot as unknown as Prisma.InputJsonValue,
        usuarioId: sessao?.user.id,
      }
    }),
    // Atualiza status do kit
    prisma.mediaKit.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publicadoEm: new Date(),
      }
    })
  ]);

  revalidatePath("/erp/midia-kit");
  revalidatePath(`/erp/midia-kit/${id}`);
  revalidatePath(`/midia-kit/${mediaKit.slug}`);

  return { success: true };
}
