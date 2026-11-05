"use server";

import { redirect } from "next/navigation";

import { confirmarPorToken, descadastrarPorToken } from "@/lib/newsletter/inscricao";
import { isTokenValido } from "@/lib/newsletter/regras";

/**
 * Confirmar e descadastrar acontecem por POST (botão na página), nunca ao só
 * abrir o link: filtros antispam e pré-visualizações de e-mail abrem os links
 * sozinhos e confirmariam/descadastrariam sem a pessoa pedir.
 */

function voltarPara(caminho: string, token: string) {
  redirect(`${caminho}?token=${encodeURIComponent(token)}`);
}

export async function confirmarInscricao(formData: FormData) {
  const token = formData.get("token")?.toString();
  if (!isTokenValido(token)) redirect("/newsletter/confirmar");
  await confirmarPorToken(token);
  voltarPara("/newsletter/confirmar", token);
}

export async function descadastrarInscricao(formData: FormData) {
  const token = formData.get("token")?.toString();
  if (!isTokenValido(token)) redirect("/newsletter/descadastrar");
  await descadastrarPorToken(token);
  voltarPara("/newsletter/descadastrar", token);
}
