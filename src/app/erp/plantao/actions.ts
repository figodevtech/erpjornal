"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";

import { enviarAlertaTelegram } from "@/lib/alertas/telegram";
import { exigirPermissao } from "@/lib/auth";
import { registrarAuditoria } from "@/lib/auditoria";
import {
  PRAZOS_PLANTAO_HORAS,
  TAMANHO_MAXIMO_TEXTO_PLANTAO,
  calcularExpiracao,
  excedentesDoLimite,
  mensagemTelegramDoPlantao,
} from "@/lib/plantao";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-url";

type Resultado = { ok: true } | { ok: false; error: string };

const NovoPlantao = z.object({
  texto: z
    .string()
    .trim()
    .min(5, "Escreva o aviso (pelo menos 5 caracteres).")
    .max(TAMANHO_MAXIMO_TEXTO_PLANTAO, `O aviso pode ter no máximo ${TAMANHO_MAXIMO_TEXTO_PLANTAO} caracteres.`),
  artigoId: z.union([z.literal(""), z.uuid()]),
  link: z.union([z.literal(""), z.url({ protocol: /^https$/, message: "O link externo precisa começar com https://." })]),
  prazoHoras: z.coerce
    .number()
    .refine((horas) => (PRAZOS_PLANTAO_HORAS as readonly number[]).includes(horas), "Prazo inválido."),
});

function atualizarPortal() {
  revalidatePath("/api/plantao");
  revalidatePath("/erp/plantao");
}

export async function publicarPlantao(formData: FormData): Promise<Resultado> {
  const sessao = await exigirPermissao("plantao:gerir");

  const dados = NovoPlantao.safeParse({
    texto: formData.get("texto")?.toString() ?? "",
    artigoId: formData.get("artigoId")?.toString() ?? "",
    link: formData.get("link")?.toString().trim() ?? "",
    prazoHoras: formData.get("prazoHoras")?.toString() ?? "0",
  });
  if (!dados.success) return { ok: false, error: dados.error.issues[0]?.message ?? "Dados inválidos." };

  const { texto, prazoHoras } = dados.data;
  const artigoId = dados.data.artigoId || null;
  const link = dados.data.link || null;

  const artigo = artigoId
    ? await prisma.artigo.findUnique({ where: { id: artigoId }, select: { slug: true } })
    : null;
  if (artigoId && !artigo) {
    return { ok: false, error: "A matéria escolhida não existe mais." };
  }

  await prisma.$transaction(async (tx) => {
    const novo = await tx.plantao.create({
      data: { texto, artigoId, link, expiraEm: calcularExpiracao(prazoHoras), autorId: sessao.user.id },
    });

    // Limite de avisos no ar: os mais antigos saem sozinhos.
    const ativos = await tx.plantao.findMany({
      where: { ativo: true },
      orderBy: { criadoEm: "desc" },
      select: { id: true },
    });
    const excedentes = excedentesDoLimite(ativos);
    if (excedentes.length > 0) {
      await tx.plantao.updateMany({ where: { id: { in: excedentes } }, data: { ativo: false } });
    }

    await registrarAuditoria(
      {
        usuarioId: sessao.user.id,
        acao: "CRIACAO",
        entidade: "plantao",
        entidadeId: novo.id,
        depois: { texto, artigoId, link, expiraEm: novo.expiraEm, encerradosPeloLimite: excedentes },
      },
      tx
    );
  });

  atualizarPortal();

  // Alerta para o canal da redação no Telegram (se configurado), sem atrasar a resposta.
  const destino = artigo ? absoluteUrl(`/noticia/${artigo.slug}`) : link;
  const autor = sessao.user.name || sessao.user.email || "Redação";
  after(() => enviarAlertaTelegram(mensagemTelegramDoPlantao({ texto, link: destino, autor })));

  return { ok: true };
}

export async function encerrarPlantao(id: string): Promise<Resultado> {
  const sessao = await exigirPermissao("plantao:gerir");
  if (!z.uuid().safeParse(id).success) return { ok: false, error: "Aviso inválido." };

  const anterior = await prisma.plantao.findUnique({ where: { id }, select: { texto: true, ativo: true } });
  if (!anterior) return { ok: false, error: "Aviso não encontrado." };
  if (!anterior.ativo) return { ok: true };

  await prisma.$transaction(async (tx) => {
    await tx.plantao.update({ where: { id }, data: { ativo: false } });
    await registrarAuditoria(
      { usuarioId: sessao.user.id, acao: "ENCERRAMENTO", entidade: "plantao", entidadeId: id, antes: anterior },
      tx
    );
  });

  atualizarPortal();
  return { ok: true };
}
