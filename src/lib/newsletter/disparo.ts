import "server-only";

import { after } from "next/server";

import { Prisma } from "@/generated/prisma/client";
import { STATUS_ARTIGO } from "@/lib/editorial/status";
import { prisma } from "@/lib/prisma";

import { enviarMateriaParaInscritos, envioDeEmailConfigurado, type MateriaNewsletter } from "./email";
import {
  ENVIO_PARADO_MS,
  JANELA_ENVIO_MS,
  STATUS_INSCRICAO,
  envioInterrompido,
  materiaElegivelParaNewsletter,
  statusDoDisparo,
} from "./regras";

/** Matérias por rodada: o resto fica para a próxima (publicação seguinte ou cron). */
const MATERIAS_POR_RODADA = 5;

const CAMPOS_MATERIA = {
  id: true,
  titulo: true,
  resumo: true,
  slug: true,
  urlImagemOg: true,
  status: true,
  canaisPublicacao: true,
  dataPublicacao: true,
  excluidoEm: true,
} as const;

type MateriaParaDisparo = MateriaNewsletter & {
  id: string;
  status: string;
  canaisPublicacao: string[];
  dataPublicacao: Date | null;
  excluidoEm: Date | null;
};

type EnvioEmAndamento = {
  id: string;
  ultimoInscritoId: string | null;
  destinatarios: number;
  enviados: number;
};

/**
 * Envia a newsletter das matérias que já estão no ar, têm o canal "newsletter"
 * marcado, foram publicadas nas últimas 48h e ainda não foram enviadas. Antes,
 * retoma envios interrompidos (função que estourou o tempo no meio dos lotes).
 * Roda depois de cada publicação e pela rota de cron.
 */
export async function dispararNewsletterPendentes(agora = new Date()) {
  if (!envioDeEmailConfigurado()) return { materias: 0, retomados: 0, motivo: "RESEND_API_KEY ausente" };

  const retomados = await retomarEnviosInterrompidos(agora);

  const candidatas = await prisma.artigo.findMany({
    where: {
      status: STATUS_ARTIGO.publicado,
      canaisPublicacao: { has: "newsletter" },
      dataPublicacao: { gte: new Date(agora.getTime() - JANELA_ENVIO_MS), lte: agora },
      envioNewsletter: null,
    },
    orderBy: { dataPublicacao: "asc" },
    take: MATERIAS_POR_RODADA,
    select: CAMPOS_MATERIA,
  });

  let materias = 0;
  for (const materia of candidatas) {
    if (!materiaElegivelParaNewsletter(materia, agora)) continue;
    if (await dispararMateria(materia)) materias++;
  }
  return { materias, retomados };
}

async function dispararMateria(materia: MateriaParaDisparo) {
  // Reserva o disparo: o índice único em artigo_id impede dois envios da mesma
  // matéria (duas publicações seguidas, cron rodando junto etc.).
  let envio: EnvioEmAndamento;
  try {
    envio = await prisma.envioNewsletter.create({
      data: { artigoId: materia.id },
      select: { id: true, ultimoInscritoId: true, destinatarios: true, enviados: true },
    });
  } catch (erro) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError && erro.code === "P2002") return false;
    throw erro;
  }

  await enviarRestante(envio, materia);
  return true;
}

/**
 * Retoma envios "enviando" sem progresso há mais de ENVIO_PARADO_MS. A chave de
 * idempotência por lote garante que quem já recebeu não recebe de novo.
 */
async function retomarEnviosInterrompidos(agora: Date) {
  const limite = new Date(agora.getTime() - ENVIO_PARADO_MS);
  const parados = await prisma.envioNewsletter.findMany({
    where: { status: "enviando", atualizadoEm: { lt: limite } },
    orderBy: { iniciadoEm: "asc" },
    take: MATERIAS_POR_RODADA,
    select: {
      id: true,
      status: true,
      atualizadoEm: true,
      ultimoInscritoId: true,
      destinatarios: true,
      enviados: true,
      artigo: { select: CAMPOS_MATERIA },
    },
  });

  let retomados = 0;
  for (const { artigo, status, atualizadoEm, ...envio } of parados) {
    if (!envioInterrompido({ status, atualizadoEm }, agora)) continue;
    // Reivindica o envio (outro cron pode ter pegado o mesmo ao mesmo tempo).
    const { count } = await prisma.envioNewsletter.updateMany({
      where: { id: envio.id, status: "enviando", atualizadoEm: { lt: limite } },
      data: { atualizadoEm: new Date() },
    });
    if (count === 0) continue;

    if (!materiaElegivelParaNewsletter(artigo, agora)) {
      // Matéria saiu do ar ou passou da janela de 48h: encerra com o que já foi entregue.
      await prisma.envioNewsletter.update({
        where: { id: envio.id },
        data: {
          status: envio.enviados > 0 ? "parcial" : "falhou",
          erro: "Envio interrompido; a matéria saiu do ar ou passou da janela de 48h antes da retomada.",
          concluidoEm: new Date(),
        },
      });
      continue;
    }

    console.info(`[newsletter] retomando envio ${envio.id} depois de interrupção`);
    await enviarRestante(envio, artigo);
    retomados++;
  }
  return retomados;
}

/** Envia aos confirmados depois do cursor, gravando o progresso a cada lote. */
async function enviarRestante(envio: EnvioEmAndamento, materia: MateriaParaDisparo) {
  const inscritos = await prisma.inscricaoNewsletter.findMany({
    where: {
      status: STATUS_INSCRICAO.confirmado,
      ...(envio.ultimoInscritoId ? { id: { gt: envio.ultimoInscritoId } } : {}),
    },
    // Ordem estável: o cursor (último id enviado) só funciona com ordenação fixa.
    orderBy: { id: "asc" },
    select: { id: true, email: true, token: true },
  });

  let destinatarios = envio.destinatarios;
  let enviados = envio.enviados;
  let ultimoErro: string | undefined;

  await enviarMateriaParaInscritos(materia, inscritos, `newsletter-${materia.id}`, async ({ lote, enviado, erro }) => {
    destinatarios += lote.length;
    if (enviado) enviados += lote.length;
    if (erro) ultimoErro = erro;
    await prisma.envioNewsletter.update({
      where: { id: envio.id },
      data: {
        ultimoInscritoId: lote[lote.length - 1].id,
        destinatarios,
        enviados,
        erro: ultimoErro?.slice(0, 500) ?? null,
      },
    });
  });

  await prisma.envioNewsletter.update({
    where: { id: envio.id },
    data: {
      destinatarios,
      enviados,
      status: statusDoDisparo(destinatarios, enviados),
      erro: ultimoErro?.slice(0, 500) ?? null,
      concluidoEm: new Date(),
    },
  });
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
