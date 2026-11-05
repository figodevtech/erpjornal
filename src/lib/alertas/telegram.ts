import "server-only";

export function telegramConfigurado() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim());
}

/**
 * Manda uma mensagem (modo HTML) para o canal da redação. Nunca lança erro nem
 * registra o token: alerta é complemento, não pode derrubar a publicação.
 */
export async function enviarAlertaTelegram(mensagemHtml: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return false;

  try {
    const resposta = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensagemHtml.slice(0, 4000),
        parse_mode: "HTML",
        link_preview_options: { is_disabled: true },
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!resposta.ok) {
      const corpo = (await resposta.json().catch(() => null)) as { description?: string } | null;
      console.error(`[telegram] alerta não enviado: HTTP ${resposta.status} ${corpo?.description ?? ""}`.trim());
      return false;
    }
    return true;
  } catch (erro) {
    console.error("[telegram] alerta não enviado:", erro instanceof Error ? erro.message : erro);
    return false;
  }
}
