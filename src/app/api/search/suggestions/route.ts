import { NextRequest, NextResponse } from "next/server";
import { SearchService } from "@/lib/services/search-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    
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
