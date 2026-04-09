import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { ArticleStatus } from "@/lib/types/article-status";

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
      const cached = await redis.get(cacheKey) as any;
      if (cached) {
        // Reidrata datas que foram serializadas como string pelo JSON
        const rehydrated = (cached.results || []).map((r: any) => ({
          ...r,
          date: r.date ? new Date(r.date) : undefined,
        }));
        return { results: rehydrated, total: cached.total };
      }
    } catch (e) {
      console.warn("Redis search cache error:", e);
    }

    // 1. Buscas em Paralelo - Ativar apenas os tipos solicitados para economizar recursos e não poluir resultados
    const searchTypes = options.type || ["noticia", "autor", "categoria", "politico", "podcast", "video"];
    
    const [artigos, categories, authors, politicians, podcasts, videos] = await Promise.all([
      searchTypes.includes("noticia") ? this.searchArticles(cleanQuery, options) : Promise.resolve([]),
      searchTypes.includes("categoria") ? this.searchCategories(cleanQuery) : Promise.resolve([]),
      searchTypes.includes("autor") ? this.searchAuthors(cleanQuery) : Promise.resolve([]),
      searchTypes.includes("politico") ? this.searchPoliticians(cleanQuery) : Promise.resolve([]),
      searchTypes.includes("podcast") ? this.searchPodcasts(cleanQuery) : Promise.resolve([]),
      searchTypes.includes("video") ? this.searchVideos(cleanQuery) : Promise.resolve([])
    ]);

    // 2. Unificar e Rankear
    let allResults: SearchResult[] = [
      ...artigos,
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
      status: ArticleStatus.publicado,
    };

    // OR de texto apenas quando houver query
    if (query) {
      where.OR = [
        { titulo: { contains: query, mode: "insensitive" } },
        { resumo: { contains: query, mode: "insensitive" } },
      ];
    }

    // Filtro por categoria (slug)
    if (options.category) where.categoria = { slug: options.category };

    // Filtro por autor: aceita tanto UUID (id) quanto nome parcial
    if (options.author) {
      const isUUID = /^[0-9a-f-]{36}$/i.test(options.author);
      if (isUUID) {
        where.autorId = options.author;
      } else {
        where.autor = { nome: { contains: options.author, mode: "insensitive" } };
      }
    }

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
      where.dataPublicacao = {};
      if (startDate) where.dataPublicacao.gte = startDate;
      if (options.endDate) where.dataPublicacao.lte = options.endDate;
    }

    // Ordenação no banco para garantir que pegamos os Corretos no 'take'
    const orderBy: any = {};
    if (options.sortBy === "newest") {
      orderBy.dataPublicacao = "desc";
    } else {
      // Por padrão ou "relevance" (vistas)
      orderBy.visualizacoes = "desc";
    }

    const artigos = await prisma.artigo.findMany({
      where,
      select: {
        id: true,
        titulo: true,
        slug: true,
        resumo: true,
        urlImagemOg: true,
        dataPublicacao: true,
        visualizacoes: true,
        categoria: { select: { nome: true } },
        autor: { select: { nome: true } }
      },
      orderBy,
      take: 100, // Aumentado para melhor rankeamento em memória depois
    });

    const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    return artigos.map((art) => {
      let score = 0;
      const views = art.visualizacoes ?? 0;

      if (query) {
        const lowerTitle = art.titulo.toLowerCase();
        const lowerQuery = query.toLowerCase();
        
        let matchScore = 0;
        if (lowerTitle.includes(lowerQuery)) matchScore += 1000;
        if (lowerTitle.startsWith(lowerQuery)) matchScore += 500;
        if (art.resumo?.toLowerCase().includes(lowerQuery)) matchScore += 200;
        
        // "Relevantes são as mais vistas" - views é o fator base, matchScore é o boost de busca
        score = views + matchScore;
      } else {
        // Sem query: puramente visualizações
        score = views;
      }

      // Boost de frescor (Cair no topo se for muito recente, mas sem quebrar as vistas)
      if (art.dataPublicacao && art.dataPublicacao > fortyEightHoursAgo) {
        score += (score * 0.2); // +20% para novidades
      }

      return {
        id: art.id,
        type: "noticia",
        title: art.titulo,
        subtitle: art.resumo || undefined,
        slug: art.slug,
        image: art.urlImagemOg || undefined,
        date: art.dataPublicacao || undefined,
        metadata: {
          categoria: art.categoria?.nome,
          autor: art.autor.nome || undefined,
        },
        score,
      };
    });
  }

  private static async searchCategories(query: string): Promise<SearchResult[]> {
    const categories = await prisma.categoria.findMany({
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
    const authors = await prisma.usuario.findMany({
      where: {
        nome: { contains: query, mode: "insensitive" },
        artigosAutor: { some: {} } // Somente quem tem artigos
      },
      take: 5,
    });

    return authors.map((auth) => ({
      id: auth.id,
      type: "autor",
      title: auth.nome || "Autor",
      slug: auth.id, // Auth não tem slug no DB atual, usaremos ID ou nome slugificado
      score: 35,
    }));
  }

  private static async searchPoliticians(query: string): Promise<SearchResult[]> {
    const politicians = await prisma.politico.findMany({
      where: { nome: { contains: query, mode: "insensitive" } },
      take: 5,
    });

    return politicians.map((p) => ({
      id: p.id,
      type: "politico",
      title: p.nome,
      slug: p.id,
      image: p.urlFoto || undefined,
      metadata: {
        partido: p.partido || undefined,
      },
      score: 25,
    }));
  }

  private static async searchPodcasts(query: string): Promise<SearchResult[]> {
    const episodes = await prisma.episodioPodcast.findMany({
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
      image: ep.urlCapa || undefined,
      date: ep.dataPub,
      metadata: { duracao: ep.duracao || undefined },
      score: 15,
    }));
  }

  private static async searchVideos(query: string): Promise<SearchResult[]> {
    const videos = await prisma.videoCurto.findMany({
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
      image: v.urlCapa || undefined,
      date: v.dataPub,
      metadata: { duracao: v.duracao || undefined },
      score: 15,
    }));
  }

  /**
   * Sugestões rápidas para o Autocomplete (Placeholders/Search-as-you-type)
   */
  static async getSuggestions(query: string): Promise<string[]> {
    if (query.length < 3) return [];

    const suggestions = await prisma.artigo.findMany({
      where: {
        status: ArticleStatus.publicado,
        titulo: { contains: query, mode: "insensitive" },
      },
      take: 8,
      select: { titulo: true },
    });

    return Array.from(new Set(suggestions.map(s => s.titulo)));
  }
}
