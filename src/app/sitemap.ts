import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://revistagestao.com.br"; // Alterar p/ domínio oficial depois

  // 1. URLs base fixas
  const standardPgs: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];

  // 2. Busca de artigos indexáveis e publicados oficializados
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
    take: 1000, 
  });

  const articlePgs: MetadataRoute.Sitemap = articles.map((art) => ({
    url: `${baseUrl}/noticia/${art.slug}`,
    lastModified: art.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Busca de Categorias (Taxonomia principal)
  const categories = await prisma.category.findMany({
    select: { slug: true }
  });

  const categoryPgs: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/categoria/${cat.slug}`,
    lastModified: new Date(), 
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...standardPgs, ...categoryPgs, ...articlePgs];
}
