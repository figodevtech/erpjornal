import type { MetadataRoute } from "next";

import { isModuleEnabled } from "@/lib/config/modules";
import { filtroArtigoNoAr } from "@/lib/data/artigos";
import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

// Regenera a cada hora: antes o sitemap era gerado só no build e nunca incluía matérias novas.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const agora = new Date();

  const fixas: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: agora, changeFrequency: "hourly", priority: 1.0 },
    { url: `${baseUrl}/edicoes-anteriores`, lastModified: agora, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/sobre`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/contato`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/assine`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/politica-de-privacidade`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Seções desligadas em src/lib/config/modules.ts não entram no sitemap.
  if (isModuleEnabled("podcasts")) {
    fixas.push({ url: `${baseUrl}/podcasts`, lastModified: agora, changeFrequency: "daily", priority: 0.7 });
  }
  if (isModuleEnabled("videos")) {
    fixas.push({ url: `${baseUrl}/videos`, lastModified: agora, changeFrequency: "daily", priority: 0.6 });
  }

  const [artigos, categorias, revistas, podcasts, politicos, tags] = await Promise.all([
    prisma.artigo.findMany({
      where: filtroArtigoNoAr(agora),
      select: { slug: true, atualizadoEm: true },
      orderBy: { dataPublicacao: "desc" },
      take: 5000,
    }),
    prisma.categoria.findMany({ select: { slug: true } }),
    prisma.revista.findMany({ select: { id: true, updatedAt: true } }),
    isModuleEnabled("podcasts")
      ? prisma.episodioPodcast.findMany({
          where: { status: "published" },
          select: { slug: true, atualizadoEm: true },
        })
      : Promise.resolve([]),
    prisma.politico.findMany({
      where: { slug: { not: null } },
      select: { slug: true, atualizadoEm: true },
    }),
    // Só tags com matéria no ar (tag usada apenas em rascunho não é pública).
    prisma.tag.findMany({
      where: { artigos: { some: { artigo: { ...filtroArtigoNoAr(agora), excluidoEm: null } } } },
      select: { slug: true },
      take: 5000,
    }),
  ]);

  return [
    ...fixas,
    ...categorias.map((categoria) => ({
      url: `${baseUrl}/categoria/${categoria.slug}`,
      lastModified: agora,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...artigos.map((artigo) => ({
      url: `${baseUrl}/noticia/${artigo.slug}`,
      lastModified: artigo.atualizadoEm,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...revistas.map((revista) => ({
      url: `${baseUrl}/revistas/${revista.id}`,
      lastModified: revista.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...politicos.map((politico) => ({
      url: `${baseUrl}/politico/${politico.slug}`,
      lastModified: politico.atualizadoEm,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...tags.map((tag) => ({
      url: `${baseUrl}/tag/${tag.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.5,
    })),
    ...podcasts.map((podcast) => ({
      url: `${baseUrl}/podcasts/${podcast.slug}`,
      lastModified: podcast.atualizadoEm,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
