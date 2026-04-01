import { NextRequest, NextResponse } from "next/server";
import { SearchService, SearchOptions } from "@/lib/services/search-service";
import { searchRateLimit, getIP } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    
    // --- RATE LIMIT CHECK ---
    const ip = getIP(req);
    const { success, limit, remaining, reset } = await searchRateLimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      );
    }
    // ------------------------

    const category = searchParams.get("category");
    const author = searchParams.get("author");

    if (!query && !category && !author) {
      return NextResponse.json({ results: [], total: 0 });
    }

    const options: SearchOptions = {
      query,
      limit: parseInt(searchParams.get("limit") || "10"),
      offset: parseInt(searchParams.get("offset") || "0"),
      category: searchParams.get("category") || undefined,
      author: searchParams.get("author") || undefined,
      sortBy: (searchParams.get("sortBy") as any) || "relevance",
    };

    const results = await SearchService.search(options);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}
