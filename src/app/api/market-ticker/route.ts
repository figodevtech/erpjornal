import { NextResponse } from "next/server";

import { getMarketTicker } from "@/lib/market-ticker";

export async function GET() {
  const data = await getMarketTicker();

  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
