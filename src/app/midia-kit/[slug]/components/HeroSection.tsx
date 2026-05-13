import { MediaKitHeroData, MediaKitTheme } from "@/types/media-kit";

interface Props {
  data: MediaKitHeroData;
  theme: MediaKitTheme;
}

export default function HeroSection({ data, theme }: Props) {
  const hasBackground = !!data.backgroundImage;

  return (
    <section
      id="section-hero"
      className="relative flex min-h-[85vh] items-center overflow-hidden"
      style={{
        backgroundColor: hasBackground ? undefined : theme.secondaryColor,
      }}
    >
      {/* Background image with overlay */}
      {hasBackground && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${data.backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/30" />
        </>
      )}

      {/* Decorative gradient orb (no-image fallback) */}
      {!hasBackground && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px]"
            style={{ backgroundColor: theme.primaryColor }}
          />
          <div
            className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full opacity-15 blur-[100px]"
            style={{ backgroundColor: theme.primaryColor }}
          />
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-12" style={{ backgroundColor: theme.primaryColor }} />
            <span
              className="text-[11px] font-black uppercase tracking-[0.2em]"
              style={{ color: hasBackground ? "#fff" : theme.primaryColor }}
            >
              Mídia Kit Comercial
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[1.05] tracking-tight"
            style={{ color: hasBackground ? "#fff" : theme.textColor }}
          >
            {data.title || "Sua marca em posições de alta visibilidade"}
          </h1>

          {/* Subtitle */}
          {data.subtitle && (
            <p
              className="mt-6 max-w-2xl text-lg font-medium leading-relaxed md:text-xl"
              style={{ color: hasBackground ? "rgba(255,255,255,0.85)" : `${theme.textColor}bb` }}
            >
              {data.subtitle}
            </p>
          )}

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={data.ctaLink || "#section-contact"}
              className="inline-flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: theme.primaryColor, color: "#fff" }}
            >
              {data.ctaText || "Solicitar Proposta"}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#section-features"
              className="inline-flex items-center gap-2 rounded-xl border-2 px-7 py-4 text-base font-bold transition-all hover:shadow-lg"
              style={{
                borderColor: hasBackground ? "rgba(255,255,255,0.3)" : `${theme.textColor}33`,
                color: hasBackground ? "#fff" : theme.textColor,
              }}
            >
              Ver Formatos
            </a>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{
          background: `linear-gradient(to top, ${theme.backgroundColor}, transparent)`,
        }}
      />
    </section>
  );
}
