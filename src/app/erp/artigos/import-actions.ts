"use server";

import { exigirPermissao } from "@/lib/auth";
import { fetchExterno, lerCorpoLimitado } from "@/lib/http/fetch-externo";

const LIMITE_HTML = 3 * 1024 * 1024; // 3 MB

export async function scrapeNews(url: string) {
  await exigirPermissao("artigos:criar");

  try {
    // fetchExterno bloqueia SSRF: redes internas, metadados de nuvem, esquemas não-http.
    const res = await fetchExterno(url, {
      headers: { "User-Agent": "RevistaGestao-Bot/1.0" },
    });

    if (!res.ok) throw new Error("Falha ao acessar URL");
    const html = (await lerCorpoLimitado(res, LIMITE_HTML)).toString("utf-8");

    const titleMatch =
      html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<title>([^<]+)<\/title>/i);

    const descMatch =
      html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace("www.", "");

    return {
      titulo: titleMatch?.[1]?.trim() || "",
      resumo: descMatch?.[1]?.trim() || "",
      fonte: domain.charAt(0).toUpperCase() + domain.slice(1),
      url_original: url,
    };
  } catch (error) {
    console.error("Scrape Error:", error);
    return null;
  }
}
