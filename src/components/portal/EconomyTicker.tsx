import { getMarketTicker } from "@/lib/market-ticker";
import { SeparatorVertical } from "lucide-react";

const currencyFormatters = new Map<string, Intl.NumberFormat>();

function getCurrencyFormatter(currency: string) {
  const cached = currencyFormatters.get(currency);
  if (cached) return cached;

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "BRL" ? 2 : 2,
  });
  currencyFormatters.set(currency, formatter);
  return formatter;
}

function formatPrice(price: number, currency: string | null) {
  if (currency) {
    return getCurrencyFormatter(currency).format(price);
  }

  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: price >= 1000 ? 0 : 2,
  }).format(price);
}

function formatPercent(value: number | null) {
  if (value === null) return null;

  return `${value >= 0 ? "+" : ""}${value.toFixed(2).replace(".", ",")}%`;
}

export default async function EconomyTicker() {
  const { items } = await getMarketTicker();
  if (items.length === 0) return null;

  const loopItems = [...items, ...items];

  return (
    <section
      aria-label="Cotações de mercado"
      className="w-full overflow-hidden border-b border-red-950 bg-red-700 text-white"
    >
      <div className="flex h-7 items-center">
        <div className="relative z-10 flex gap-2 h-full shrink-0 items-center bg-red-950 px-4 text-[10px] font-black uppercase tracking-[0.22em] shadow-[8px_0_18px_rgba(127,29,29,0.65)]">
          <div className="size-2 rounded-full bg-red-500 animate-pulse"></div>
          <span>
            Mercado
          </span>
        </div>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="market-ticker-track inline-flex items-center whitespace-nowrap">
            {loopItems.map((item, index) => {
              const percent = formatPercent(item.percentChange);
              const isPositive = (item.percentChange ?? 0) >= 0;
              const isNeutral = item.percentChange === null || item.percentChange === 0;

              return (
               <div key={`${item.symbol}-${index}`} className="flex flex-row gap-2 items-center justify-center p-1">

                <span
                  
                  className="inline-flex items-center gap-2 px-6 text-[10px] antialiased uppercase tracking-widest"
                >
                  <span className="text-white/90 font-bold">{item.label}:</span>
                  <span className="text-white">{formatPrice(item.price, item.currency)}</span>
                  {percent && (
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] shadow-sm ${
                        isNeutral
                          ? "bg-white/10 text-white/80"
                          : isPositive
                          ? "bg-emerald-400 text-emerald-950"
                          : "bg-red-950 text-red-100 ring-1 ring-red-300/40"
                      }`}
                    >
                      {isPositive ? "▲" : "▼"} {percent}
                    </span>
                  )}
                </span>
                <SeparatorVertical key={`sep-${index}`} className="h-4 w-px bg-white/60" />
               </div>
             
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
