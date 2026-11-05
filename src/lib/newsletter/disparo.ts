import "server-only";

import { after } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { STATUS_ARTIGO } from "@/lib/editorial/status";
import { prisma } from "@/lib/prisma";

import { enviarMateriaParaInscritos, envioDeEmailConfigurado, type MateriaNewsletter } from "./email";
import { JANELA_ENVIO_MS, STATUS_INSCRICAO, materiaElegivelParaNewsletter, statusDoDisparo } from "./regras";

/** Matérias por rodada: o resto fica para a próxima (publicação seguinte ou cron). */
const MATERIAS_POR_RODADA = 5;

/**
 * Envia a newsletter das matérias que já estão no ar, têm o canal "newsletter"
 * marcado, foram publicadas nas últimas 48h e ainda não foram enviadas.
 * Roda depois de cada publicação e pela rota de cron (para as agendadas).
 */
export async function dispararNewsletterPendentes(agora = new Date()) {
  if (!envioDeEmailConfigurado()) return { materias: 0, motivo: "RESEND_API_KEY ausente" };

  const candidatas = await prisma.artigo.findMany({
    where: {
      status: STATUS_ARTIGO.publicado,
      canaisPublicacao: { has: "newsletter" },
      dataPublicacao: { gte: new Date(agora.getTime() - JANELA_ENVIO_MS), lte: agora },
      envioNewsletter: null,
    },
    orderBy: { dataPublicacao: "asc" },
    take: MATERIAS_POR_RODADA,
    select: {
      id: true,
      titulo: true,
      resumo: true,
      slug: true,
      urlImagemOg: true,
      status: true,
      canaisPublicacao: true,
      dataPublicacao: true,
      excluidoEm: true,
    },
  });

  let materias = 0;
  for (const materia of candidatas) {
    if (!materiaElegivelParaNewsletter(materia, agora)) continue;
    if (await dispararMateria(materia)) materias++;
  }
  return { materias };
}

async function dispararMateria(materia: MateriaNewsletter & { id: string }) {
  // Reserva o disparo: o índice único em artigo_id impede dois envios da mesma
  // matéria (duas publicações seguidas, cron rodando junto etc.).
  let envioId: string;
  try {
    ({ id: envioId } = await prisma.envioNewsletter.create({ data: { artigoId: materia.id }, select: { id: true } }));
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") return false;
    throw erro;
  }

  const inscritos = await prisma.inscricaoNewsletter.findMany({
    where: { status: STATUS_INSCRICAO.confirmado },
    select: { email: true, token: true },
  });
  await prisma.envioNewsletter.update({ where: { id: envioId }, data: { destinatarios: inscritos.length } });

  const { enviados, erro } = await enviarMateriaParaInscritos(materia, inscritos, `newsletter-${materia.id}`);
  await prisma.envioNewsletter.update({
    where: { id: envioId },
    data: {
      enviados,
      status: statusDoDisparo(inscritos.length, enviados),
      erro: erro?.slice(0, 500) ?? null,
      concluidoEm: new Date(),
    },
  });
  return true;
}

/** Agenda o disparo para depois da resposta (a publicação não espera o envio). */
export function agendarDisparoNewsletter() {
  after(async () => {
    try {
      await dispararNewsletterPendentes();
    } catch (erro) {
      console.error("[newsletter] falha no disparo:", erro);
    }
  });
}
