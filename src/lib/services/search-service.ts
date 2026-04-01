import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

export type SearchResultType = "noticia" | "autor" | "categoria" | "politico" | "podcast" | "video";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  slug: string;
  image?: string;
  date?: Date;
  metadata?: {
    categoria?: string;
    autor?: string;
    partido?: string;
    duracao?: number;
  };
  score: number;
}

export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
  type?: SearchResultType[];
  category?: string;
  author?: string;
  startDate?: Date;
  endDate?: Date;
  dateRange?: "all" | "today" | "week" | "month";
  sortBy?: "relevance" | "newest";
}

export class SearchService {
  /**
   * Realiza busca em múltiplas tabelas com ranking e filtros
   */
  static async search(options: SearchOptions): Promise<{ results: SearchResult[]; total: number }> {
    const { query, limit = 10, offset = 0, sortBy = "relevance" } = options;
    const cleanQuery = query.trim().toLowerCase();
    const hasFilters = !!(options.category || options.author || options.startDate || options.endDate);
    if (!cleanQuery && !hasFilters) return { results: [], total: 0 };

    // 0. Cache via Redis
    const cacheKey = `search:v2:${Buffer.from(JSON.stringify(options)).toString('base64')}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return cached as { results: SearchResult[]; total: number };
    } catch (e) {
      console.warn("Redis search cache error:", e);
    }

    // 1. Buscas Sequenciais (Resiliência contra Pool Limit: 1)
    // Buscas sucessivas evitam o timeout P2024 (10 segundos de espera)
    const articles = await this.searchArticles(cleanQuery, options);
    const categories = await this.searchCategories(cleanQuery);
    const authors = await this.searchAuthors(cleanQuery);
    const politicians = await this.searchPoliticians(cleanQuery);
    const podcasts = await this.searchPodcasts(cleanQuery);
    const videos = await this.searchVideos(cleanQuery);

    // 2. Unificar e Rankear
    let allResults: SearchResult[] = [
      ...articles,
      ...categories,
      ...authors,
      ...politicians,
      ...podcasts,
      ...videos,
    ];

    // 3. Ordenação
    if (sortBy === "newest") {
      allResults.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));
    } else {
      allResults.sort((a, b) => b.score - a.score);
    }
 
    const total = allResults.length;
    const paginatedResults = allResults.slice(offset, offset + limit);
    const response = { results: paginatedResults, total };

    // 4. Salvar no Redis (5 min)
    try {
      await redis.set(cacheKey, JSON.stringify(response), { ex: 300 });
    } catch (e) {
      // Ignora erro de cache
    }

    return response;
  }

  private static async searchArticles(query: string, options: SearchOptions): Promise<SearchResult[]> {
    const now = new Date();
    const where: any = {
      status_id: "publicado",
    };

    if (query) {
      where.OR = [
        { titulo: { contains: query, mode: "insensitive" } },
        { resumo: { contains: query, mode: "insensitive" } },
        { corpo_texto: { contains: query, mode: "insensitive" } },
      ];
    }

    if (options.category) where.categoria = { slug: options.category };
    if (options.author) where.autor_id = options.author;

    // Processamento de período (dateRange)
    let startDate = options.startDate;

    if (options.dateRange && options.dateRange !== "all") {
      if (options.dateRange === "today") {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (options.dateRange === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (options.dateRange === "month") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    if (startDate || options.endDate) {
      where.data_publicacao = {};
      if (startDate) where.data_publicacao.gte = startDate;
      if (options.endDate) where.data_publicacao.lte = options.endDate;
    }

    const articles = await prisma.article.findMany({
      where,
      include: { categoria: true, autor: true },
      take: 50, // Limite para ranking em memória
    });

    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    return articles.map((art) => {
      let score = 0;
      const lowerTitle = art.titulo.toLowerCase();
      const lowerQuery = query.toLowerCase();

      // Cálculo de score
      if (lowerTitle.includes(lowerQuery)) score += 30;
      if (lowerTitle.startsWith(lowerQuery)) score += 20; // Exact match at start
      if (art.resumo?.toLowerCase().includes(lowerQuery)) score += 15;
      if (art.corpo_texto.toLowerCase().includes(lowerQuery)) score += 5;

      // Boost de frescor (20%)
      if (art.data_publicacao && art.data_publicacao > fortyEightHoursAgo) {
        score *= 1.2;
      }

      return {
        id: art.id,
        type: "noticia",
        title: art.titulo,
        subtitle: art.resumo || undefined,
        slug: art.slug,
        image: art.og_image_url || undefined,
        date: art.data_publicacao || undefined,
        metadata: {
          categoria: art.categoria?.nome,
          autor: art.autor.nome,
        },
        score,
      };
    });
  }

  private static async searchCategories(query: string): Promise<SearchResult[]> {
    const categories = await prisma.category.findMany({
      where: { nome: { contains: query, mode: "insensitive" } },
      take: 5,
    });

    return categories.map((cat) => ({
      id: cat.id,
      type: "categoria",
      title: cat.nome,
      slug: cat.slug,
      score: 40, // Categorias têm peso alto
    }));
  }

  private static async searchAuthors(query: string): Promise<SearchResult[]> {
    const authors = await prisma.user.findMany({
      where: {
        nome: { contains: query, mode: "insensitive" },
        articles_authored: { some: {} } // Somente quem tem artigos
      },
      take: 5,
    });

    return authors.map((auth) => ({
      id: auth.id,
      type: "autor",
      title: auth.nome,
      slug: auth.id, // Auth não tem slug no DB atual, usaremos ID ou nome slugificado
      score: 35,
    }));
  }

  private static async searchPoliticians(query: string): Promise<SearchResult[]> {
    const politicians = await prisma.politician.findMany({
      where: { nome: { contains: query, mode: "insensitive" } },
      take: 5,
    });

    return politicians.map((p) => ({
      id: p.id,
      type: "politico",
      title: p.nome,
      slug: p.id,
      image: p.foto_url || undefined,
      metadata: {
        partido: p.partido || undefined,
      },
      score: 25,
    }));
  }

  private static async searchPodcasts(query: string): Promise<SearchResult[]> {
    const episodes = await prisma.podcastEpisode.findMany({
      where: {
        OR: [
          { titulo: { contains: query, mode: "insensitive" } },
          { descricao: { contains: query, mode: "insensitive" } },
        ]
      },
      take: 5,
    });

    return episodes.map((ep) => ({
      id: ep.id,
      type: "podcast",
      title: ep.titulo,
      slug: ep.slug,
      image: ep.capa_url || undefined,
      date: ep.data_pub,
      metadata: { duracao: ep.duracao || undefined },
      score: 15,
    }));
  }

  private static async searchVideos(query: string): Promise<SearchResult[]> {
    const videos = await prisma.shortVideo.findMany({
      where: {
        OR: [
          { titulo: { contains: query, mode: "insensitive" } },
          { descricao: { contains: query, mode: "insensitive" } },
        ]
      },
      take: 5,
    });

    return videos.map((v) => ({
      id: v.id,
      type: "video",
      title: v.titulo,
      slug: v.slug,
      image: v.capa_url || undefined,
      date: v.data_pub,
      metadata: { duracao: v.duracao || undefined },
      score: 15,
    }));
  }

  /**
   * Sugestões rápidas para o Autocomplete (Placeholders/Search-as-you-type)
   */
  static async getSuggestions(query: string): Promise<string[]> {
    if (query.length < 2) return [];

    const suggestions = await prisma.article.findMany({
      where: {
        status_id: "publicado",
        titulo: { contains: query, mode: "insensitive" },
      },
      take: 8,
      select: { titulo: true },
    });

    return Array.from(new Set(suggestions.map(s => s.titulo)));
  }
}
