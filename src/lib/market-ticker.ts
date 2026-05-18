import { redis } from "@/lib/redis";

const TWELVE_DATA_QUOTE_URL = "https://api.twelvedata.com/quote";
const CACHE_KEY = "market:ticker:twelvedata:v2";
const CACHE_TTL_SECONDS = 300;

type TwelveDataQuote = {
  symbol?: string;
  name?: string;
  currency?: string;
  close?: string;
  change?: string;
  percent_change?: string;
  status?: string;
  message?: string;
};

export type MarketTickerItem = {
  symbol: string;
  label: string;
  price: number;
  change: number | null;
  percentChange: number | null;
  currency: string | null;
};

export type MarketTickerResponse = {
  items: MarketTickerItem[];
  updatedAt: string | null;
  error?: string;
};

const DEFAULT_SYMBOLS = ["USD/BRL", "EUR/BRL", "BTC/USD", "ETH/USD", "AAPL", "MSFT"];
const LABELS: Record<string, string> = {
  "USD/BRL": "Dólar",
  "EUR/BRL": "Euro",
  "BTC/USD": "Bitcoin",
  "ETH/USD": "Ethereum",
  AAPL: "Apple",
  MSFT: "Microsoft",
};

function getSymbols() {
  const raw = process.env.MARKET_TICKER_SYMBOLS;
  if (!raw) return DEFAULT_SYMBOLS;

  const symbols = raw
    .split(",")
    .map((symbol) => symbol.trim())
    .filter(Boolean);

  return symbols.length > 0 ? symbols : DEFAULT_SYMBOLS;
}

function parseNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeQuote(symbol: string, quote: TwelveDataQuote): MarketTickerItem | null {
  if (quote.status === "error") return null;

  const price = parseNumber(quote.close);
  if (price === null) return null;
  const quoteCurrency = symbol.includes("/") ? symbol.split("/")[1] : null;

  return {
    symbol,
    label: LABELS[symbol] ?? quote.name ?? symbol,
    price,
    change: parseNumber(quote.change),
    percentChange: parseNumber(quote.percent_change),
    currency: quote.currency ?? quoteCurrency,
  };
}

function readBatchResponse(data: unknown, symbols: string[]) {
  if (!data || typeof data !== "object") return [];

  const response = data as Record<string, TwelveDataQuote>;
  if (symbols.length === 1) {
    const item = normalizeQuote(symbols[0], response as TwelveDataQuote);
    return item ? [item] : [];
  }

  return symbols
    .map((symbol) => normalizeQuote(symbol, response[symbol] ?? response[symbol.replace("/", "")]))
    .filter((item): item is MarketTickerItem => Boolean(item));
}

export async function getMarketTicker(): Promise<MarketTickerResponse> {
  const cached = await redis.get<MarketTickerResponse>(CACHE_KEY).catch(() => null);
  if (cached) return cached;

  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    return { items: [], updatedAt: null, error: "TWELVE_DATA_API_KEY nao configurada." };
  }

  const symbols = getSymbols();
  const params = new URLSearchParams({
    symbol: symbols.join(","),
    apikey: apiKey,
    dp: "4",
  });

  try {
    const response = await fetch(`${TWELVE_DATA_QUOTE_URL}?${params.toString()}`, {
      next: { revalidate: CACHE_TTL_SECONDS },
    });
    const data = (await response.json()) as unknown;

    if (!response.ok) {
      const message =
        data && typeof data === "object" && "message" in data
          ? String((data as { message?: unknown }).message)
          : "Erro ao consultar Twelve Data.";
      return { items: [], updatedAt: null, error: message };
    }

    const items = readBatchResponse(data, symbols);
    const result = { items, updatedAt: new Date().toISOString() };
    await redis.set(CACHE_KEY, result, { ex: CACHE_TTL_SECONDS }).catch(() => null);

    return result;
  } catch (error) {
    return {
      items: [],
      updatedAt: null,
      error: error instanceof Error ? error.message : "Erro ao consultar Twelve Data.",
    };
  }
}
