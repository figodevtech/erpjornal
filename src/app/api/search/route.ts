import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { SearchService } from "@/lib/services/search-service";
import { getIP, searchRateLimit } from "@/lib/ratelimit";

const ParametrosBusca = z.object({
  q: z.string().trim().max(200).default(""),
  category: z.string().regex(/^[a-z0-9-]{1,120}$/).optional(),
  // UUID do autor ou parte do nome (o SearchService trata os dois casos).
  author: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).catch(10),
  offset: z.coerce.number().int().min(0).max(1000).catch(0),
  sortBy: z.enum(["relevance", "newest"]).catch("relevance"),
});

export async function GET(req: NextRequest) {
  try {
    // --- RATE LIMIT ---
    const { success, limit, remaining, reset } = await searchRateLimit.limit(getIP(req));
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        }
      );
    }

    const { searchParams } = new URL(req.url);
    const bruto = Object.fromEntries(
      ["q", "category", "author", "limit", "offset", "sortBy"]
        .map((chave) => [chave, searchParams.get(chave) || undefined])
        .filter(([, valor]) => valor !== undefined)
    );

    const parametros = ParametrosBusca.safeParse(bruto);
    if (!parametros.success) {
      return NextResponse.json({ error: "Parâmetros de busca inválidos" }, { status: 400 });
    }

    const { q, category, author, limit: limite, offset, sortBy } = parametros.data;
    if (!q && !category && !author) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const results = await SearchService.search({ query: q, limit: limite, offset, category, author, sortBy });
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
