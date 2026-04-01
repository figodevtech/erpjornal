import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/lib/services/search-service";
import { searchRateLimit, getIP } from "@/lib/ratelimit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    
    // --- RATE LIMIT CHECK (Shared with main search) ---
    const ip = getIP(req);
    const { success, limit, remaining, reset } = await searchRateLimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" }, 
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
    // -------------------------------------------------
    
    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const suggestions = await SearchService.getSuggestions(query);
    
    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Suggestions API Error:", error);
    return NextResponse.json({ error: "Failed to fetch suggestions" }, { status: 500 });
  }
}
