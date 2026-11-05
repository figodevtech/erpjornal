import "server-only";

import { prisma } from "@/lib/prisma";

export const MENSAGEM_CHECAGEM_OBRIGATORIA =
  "Esta categoria exige ao menos uma checagem de fato (link de fonte ou documento) para publicar.";

/** Regra do PRD: categorias de política interna exigem checagem de fatos para publicar. */
export async function categoriaExigeChecagem(categoriaId: string | null | undefined): Promise<boolean> {
  if (!categoriaId) return false;
  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaId },
    select: { exigeChecagem: true },
  });
  return categoria?.exigeChecagem ?? false;
}
