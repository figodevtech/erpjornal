"use server";

export async function scrapeNews(url: string) {
  try {
    const res = await fetch(url, { 
      headers: { "User-Agent": "RevistaGestao-Bot/1.0" },
      next: { revalidate: 0 }
    });
    
    if (!res.ok) throw new Error("Falha ao acessar URL");
    const html = await res.text();

    // Regex simples para capturar metadados (fallback se não houver DOM parser no servidor Next básico)
    const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) || 
                       html.match(/<title>([^<]+)<\/title>/i);
                       
    const descMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) || 
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
