import { MediaKitTestimonialsData, MediaKitTheme } from "@/types/media-kit";
import Image from "next/image";
import { Quote } from "lucide-react";

interface Props {
  data: MediaKitTestimonialsData;
  theme: MediaKitTheme;
}

export default function TestimonialsSection({ data, theme }: Props) {
  const items = data.items || [];
  if (items.length === 0) return null;

  return (
    <section id="section-testimonials" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {data.title && (
          <div className="mb-16 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8" style={{ backgroundColor: theme.primaryColor }} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: theme.primaryColor }}>
                Depoimentos
              </span>
              <div className="h-px w-8" style={{ backgroundColor: theme.primaryColor }} />
            </div>
            <h2 className="font-serif text-3xl font-black tracking-tight md:text-4xl" style={{ color: theme.textColor }}>
              {data.title}
            </h2>
          </div>
        )}

        <div className={`grid gap-8 ${
          items.length === 1 ? "max-w-2xl mx-auto" :
          items.length === 2 ? "sm:grid-cols-2" :
          "sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {items.map((item, i) => (
            <div
              key={i}
              className="relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:shadow-lg"
              style={{
                borderColor: `${theme.textColor}11`,
                backgroundColor: theme.backgroundColor,
              }}
            >
              {/* Quote icon */}
              <Quote
                className="mb-4 h-8 w-8 opacity-20"
                style={{ color: theme.primaryColor }}
              />

              {/* Quote text */}
              <blockquote
                className="mb-6 flex-1 text-lg font-medium italic leading-relaxed"
                style={{ color: theme.textColor }}
              >
                &ldquo;{item.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 border-t pt-5" style={{ borderColor: `${theme.textColor}11` }}>
                {item.avatarUrl ? (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-offset-2" style={{ "--tw-ring-color": `${theme.primaryColor}33` } as React.CSSProperties}>
                    <Image
                      src={item.avatarUrl}
                      alt={item.author}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-black"
                    style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
                  >
                    {item.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-black" style={{ color: theme.textColor }}>
                    {item.author}
                  </p>
                  {item.role && (
                    <p className="text-xs font-semibold" style={{ color: `${theme.textColor}77` }}>
                      {item.role}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
