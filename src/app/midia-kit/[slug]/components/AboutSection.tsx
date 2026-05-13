import { MediaKitAboutData, MediaKitTheme } from "@/types/media-kit";
import Image from "next/image";

interface Props {
  data: MediaKitAboutData;
  theme: MediaKitTheme;
}

export default function AboutSection({ data, theme }: Props) {
  return (
    <section id="section-about" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Text */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-12" style={{ backgroundColor: theme.primaryColor }} />
              <span
                className="text-[11px] font-black uppercase tracking-[0.2em]"
                style={{ color: theme.primaryColor }}
              >
                Quem Somos
              </span>
            </div>

            {data.title && (
              <h2
                className="mb-6 font-serif text-3xl font-black tracking-tight md:text-4xl"
                style={{ color: theme.textColor }}
              >
                {data.title}
              </h2>
            )}

            {data.content && (
              <div
                className="max-w-xl space-y-4 text-lg leading-relaxed"
                style={{ color: `${theme.textColor}cc` }}
              >
                {data.content.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          {data.imageUrl && (
            <div className="relative">
              {/* Decorative accent */}
              <div
                className="absolute -inset-4 -z-10 rounded-3xl opacity-10"
                style={{ backgroundColor: theme.primaryColor }}
              />
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl">
                <Image
                  src={data.imageUrl}
                  alt={data.title || "Sobre nós"}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
