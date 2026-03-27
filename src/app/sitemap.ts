import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

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
  const articles = await prisma.article.findMany({
    where: {
      status_id: "publicado",
      data_publicacao: { lte: new Date() },
    },
    select: {
      slug: true,
      updated_at: true,
    },
    orderBy: {
      data_publicacao: "desc",
    },
    take: 5000, 
  });

  const articlePgs: MetadataRoute.Sitemap = articles.map((art) => ({
    url: `${baseUrl}/noticia/${art.slug}`,
    lastModified: art.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Busca de Categorias
  const categories = await prisma.category.findMany({
    select: { slug: true }
  });

  const categoryPgs: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categoria/${cat.slug}`,
    lastModified: new Date(), 
    changeFrequency: "daily",
    priority: 0.9,
  }));

  // 4. Políticos (Perfil individual)
  const politicians = await prisma.politician.findMany({
    select: { id: true, updated_at: true }
  });

  const politicianPgs: MetadataRoute.Sitemap = politicians.map((pol) => ({
    url: `${baseUrl}/politicos/${pol.id}`,
    lastModified: pol.updated_at,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // 5. Podcast Episodes
  const podcasts = await prisma.podcastEpisode.findMany({
    where: { status: 'published' },
    select: { slug: true, updated_at: true }
  });

  const podcastPgs: MetadataRoute.Sitemap = podcasts.map((pod) => ({
    url: `${baseUrl}/podcasts/${pod.slug}`,
    lastModified: pod.updated_at,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...standardPgs, 
    ...categoryPgs, 
    ...politicianPgs, 
    ...articlePgs,
    ...podcastPgs
  ];
}
