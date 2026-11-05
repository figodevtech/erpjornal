import "server-only";

import { createElement } from "react";
import { Resend } from "resend";

import { ConfirmacaoNewsletterTemplate, NewsletterTemplate } from "@/components/emails/NewsletterTemplate";
import { absoluteUrl, getSiteUrl } from "@/lib/site-url";

import { dividirEmLotes, linksDaInscricao } from "./regras";

function remetente() {
  return process.env.EMAIL_FROM?.trim() || "Revista Gestão <contato@revistagestao.com.br>";
}

export function envioDeEmailConfigurado() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function clienteResend() {
  const chave = process.env.RESEND_API_KEY?.trim();
  return chave ? new Resend(chave) : null;
}

/** Manda o link de confirmação. Devolve false (sem lançar) se não deu para enviar. */
export async function enviarEmailDeConfirmacao(email: string, token: string): Promise<boolean> {
  const links = linksDaInscricao(getSiteUrl(), token);
  const resend = clienteResend();
  if (!resend) {
    console.warn("[newsletter] RESEND_API_KEY ausente: o e-mail de confirmação não foi enviado.");
    if (process.env.NODE_ENV !== "production") {
      // Só em desenvolvimento: permite testar a confirmação sem serviço de e-mail.
      console.info(`[newsletter] (dev) link de confirmação: ${links.confirmar}`);
    }
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: remetente(),
      to: email,
      subject: "Confirme sua inscrição na newsletter da Revista Gestão",
      react: createElement(ConfirmacaoNewsletterTemplate, { linkConfirmacao: links.confirmar }),
    });
    if (error) {
      console.error("[newsletter] falha ao enviar a confirmação:", error.message);
      return false;
    }
    return true;
  } catch (erro) {
    console.error("[newsletter] erro ao enviar a confirmação:", erro);
    return false;
  }
}

export type MateriaNewsletter = {
  titulo: string;
  resumo: string | null;
  slug: string;
  urlImagemOg: string | null;
};

/**
 * Envia a matéria aos inscritos em lotes de 100 (API de lote do Resend), cada um
 * com o próprio link de descadastro e o cabeçalho de descadastro em um clique.
 * A chave de idempotência por lote evita e-mail duplicado se o envio for repetido.
 */
export async function enviarMateriaParaInscritos(
  materia: MateriaNewsletter,
  inscritos: { email: string; token: string }[],
  chaveIdempotencia: string
): Promise<{ enviados: number; erro?: string }> {
  const resend = clienteResend();
  if (!resend) return { enviados: 0, erro: "RESEND_API_KEY ausente" };

  const site = getSiteUrl();
  const url = absoluteUrl(`/noticia/${materia.slug}`);
  const imagem = materia.urlImagemOg?.startsWith("https://") ? materia.urlImagemOg : undefined;
  let enviados = 0;
  let ultimoErro: string | undefined;

  for (const [indice, lote] of dividirEmLotes(inscritos).entries()) {
    const mensagens = lote.map(({ email, token }) => {
      const links = linksDaInscricao(site, token);
      return {
        from: remetente(),
        to: email,
        subject: materia.titulo,
        react: createElement(NewsletterTemplate, {
          title: materia.titulo,
          excerpt: materia.resumo ?? "",
          url,
          imageUrl: imagem,
          linkDescadastro: links.descadastrar,
        }),
        headers: {
          "List-Unsubscribe": `<${links.descadastrarUmClique}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      };
    });
    try {
      const { error } = await resend.batch.send(mensagens, { idempotencyKey: `${chaveIdempotencia}-lote-${indice}` });
      if (error) {
        ultimoErro = error.message;
        console.error(`[newsletter] lote ${indice} falhou:`, error.message);
        continue;
      }
      enviados += lote.length;
    } catch (erro) {
      ultimoErro = erro instanceof Error ? erro.message : String(erro);
      console.error(`[newsletter] lote ${indice} falhou:`, erro);
    }
  }

  return { enviados, erro: ultimoErro };
}
