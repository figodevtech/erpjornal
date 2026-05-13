"use client";

import { useEffect, useRef, useState } from "react";
import { MediaKitStatsData, MediaKitTheme } from "@/types/media-kit";

interface Props {
  data: MediaKitStatsData;
  theme: MediaKitTheme;
}

function AnimatedCounter({ target, suffix }: { target: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLDivElement>(null);
  const triggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          // Extract numeric part for animation
          const numMatch = target.match(/[\d,.]+/);
          if (numMatch) {
            const numStr = numMatch[0].replace(/,/g, "");
            const num = parseFloat(numStr);
            const prefix = target.slice(0, target.indexOf(numMatch[0]));
            const postfix = target.slice(target.indexOf(numMatch[0]) + numMatch[0].length);
            
            const duration = 1800;
            const steps = 40;
            const stepTime = duration / steps;
            let step = 0;

            const interval = setInterval(() => {
              step++;
              const progress = step / steps;
              // Ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.round(num * eased);
              
              // Format with locale
              const formatted = current.toLocaleString("pt-BR");
              setDisplay(`${prefix}${formatted}${postfix}`);

              if (step >= steps) {
                clearInterval(interval);
                setDisplay(target);
              }
            }, stepTime);
          } else {
            setDisplay(target);
          }
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="tabular-nums">
      {display}
      {suffix && <span className="ml-1 text-sm font-semibold opacity-60">{suffix}</span>}
    </div>
  );
}

export default function StatsSection({ data, theme }: Props) {
  const items = data.items || [];
  if (items.length === 0) return null;

  return (
    <section id="section-stats" className="relative py-20 lg:py-28">
      {/* Subtle background accent */}
      <div className="absolute inset-0" style={{ backgroundColor: `${theme.primaryColor}06` }} />

      <div className="relative mx-auto max-w-7xl px-6">
        {data.title && (
          <div className="mb-14 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8" style={{ backgroundColor: theme.primaryColor }} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: theme.primaryColor }}>
                Números
              </span>
              <div className="h-px w-8" style={{ backgroundColor: theme.primaryColor }} />
            </div>
            <h2 className="font-serif text-3xl font-black tracking-tight md:text-4xl" style={{ color: theme.textColor }}>
              {data.title}
            </h2>
          </div>
        )}

        <div className={`grid gap-6 ${
          items.length <= 3 ? "grid-cols-1 sm:grid-cols-3" :
          items.length === 4 ? "grid-cols-2 lg:grid-cols-4" :
          "grid-cols-2 lg:grid-cols-3"
        }`}>
          {items.map((item, i) => (
            <div
              key={i}
              className="group relative overflow-hidden rounded-2xl border p-8 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                backgroundColor: theme.backgroundColor,
                borderColor: `${theme.textColor}11`,
              }}
            >
              {/* Decorative line */}
              <div
                className="absolute inset-x-0 top-0 h-1 opacity-0 transition-opacity group-hover:opacity-100"
                style={{ backgroundColor: theme.primaryColor }}
              />

              <div
                className="text-[clamp(2rem,5vw,3.5rem)] font-black leading-none tracking-tight"
                style={{ color: theme.primaryColor }}
              >
                <AnimatedCounter target={item.value} suffix={item.suffix} />
              </div>
              <p
                className="mt-3 text-sm font-bold uppercase tracking-wider"
                style={{ color: `${theme.textColor}88` }}
              >
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
