const LOCAL_SITE_URL = "http://localhost:3000";

/**
 * URL pública do site, sem barra no final.
 *
 * Ordem de preferência:
 * 1. NEXT_PUBLIC_SITE_URL (definida no .env / painel da hospedagem)
 * 2. Domínio de produção ou do deploy na Vercel
 * 3. http://localhost:3000
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercelHost) return `https://${vercelHost.replace(/\/+$/, "")}`;

  return LOCAL_SITE_URL;
}

/** Monta uma URL absoluta do site a partir de um caminho (ex.: "/noticia/slug"). */
export function absoluteUrl(path = ""): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
