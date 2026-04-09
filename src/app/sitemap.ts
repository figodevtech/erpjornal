import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@/lib/types/article-status";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://revistagestao.com.br";

  // 1. URLs base fixas
  const standardPgs: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/podcasts`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/videos`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    },
  ];

  // 2. Busca de artigos indexáveis (Publicados)
  const artigos = await prisma.artigo.findMany({
    where: {
      status: ArticleStatus.publicado,
      dataPublicacao: { lte: new Date() },
    },
    select: {
      slug: true,
      atualizadoEm: true,
    },
    orderBy: {
      dataPublicacao: "desc",
    },
    take: 5000, 
  });

  const artigoPgs: MetadataRoute.Sitemap = artigos.map((art) => ({
    url: `${baseUrl}/noticia/${art.slug}`,
    lastModified: art.atualizadoEm,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Busca de Categorias
  const categories = await prisma.categoria.findMany({
    select: { slug: true }
  });

  const categoryPgs: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categoria/${cat.slug}`,
    lastModified: new Date(), 
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // 4. Políticos (Perfil individual)
  const politicians = await prisma.politico.findMany({
    select: { id: true, atualizadoEm: true }
  });

  const politicianPgs: MetadataRoute.Sitemap = politicians.map((pol) => ({
    url: `${baseUrl}/politicos/${pol.id}`,
    lastModified: pol.atualizadoEm,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // 5. Podcast Episodes
  const podcasts = await prisma.episodioPodcast.findMany({
    where: { status: 'published' },
    select: { slug: true, atualizadoEm: true }
  });

  const podcastPgs: MetadataRoute.Sitemap = podcasts.map((pod) => ({
    url: `${baseUrl}/podcasts/${pod.slug}`,
    lastModified: pod.atualizadoEm,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...standardPgs, 
    ...categoryPgs, 
    ...politicianPgs, 
    ...artigoPgs,
    ...podcastPgs
  ];
}
