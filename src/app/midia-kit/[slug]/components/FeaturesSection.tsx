import { MediaKitFeaturesData, MediaKitTheme } from "@/types/media-kit";
import { Star, Users, TrendingUp, Zap, Eye, Target, Globe, Award, BarChart3, Newspaper, Monitor, Smartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Props {
  data: MediaKitFeaturesData;
  theme: MediaKitTheme;
}

const iconMap: Record<string, LucideIcon> = {
  star: Star,
  users: Users,
  trending: TrendingUp,
  zap: Zap,
  eye: Eye,
  target: Target,
  globe: Globe,
  award: Award,
  chart: BarChart3,
  newspaper: Newspaper,
  desktop: Monitor,
  mobile: Smartphone,
};

export default function FeaturesSection({ data, theme }: Props) {
  const items = data.items || [];
  if (items.length === 0) return null;

  return (
    <section
      id="section-features"
      className="relative py-20 lg:py-28"
      style={{ backgroundColor: theme.secondaryColor }}
    >
      <div className="mx-auto max-w-7xl px-6">
        {data.title && (
          <div className="mb-16 text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8" style={{ backgroundColor: `${theme.primaryColor}` }} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: theme.primaryColor }}>
                Diferenciais
              </span>
              <div className="h-px w-8" style={{ backgroundColor: `${theme.primaryColor}` }} />
            </div>
            <h2
              className="font-serif text-3xl font-black tracking-tight md:text-4xl"
              style={{ color: theme.backgroundColor }}
            >
              {data.title}
            </h2>
          </div>
        )}

        <div className={`grid gap-6 ${
          items.length <= 3 ? "sm:grid-cols-3" :
          items.length === 4 ? "sm:grid-cols-2 lg:grid-cols-4" :
          "sm:grid-cols-2 lg:grid-cols-3"
        }`}>
          {items.map((item, i) => {
            const IconComp = iconMap[item.icon || "star"] || Star;
            return (
              <div
                key={i}
                className="group rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  backgroundColor: `${theme.backgroundColor}0d`,
                  borderColor: `${theme.backgroundColor}15`,
                }}
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${theme.primaryColor}22` }}
                >
                  <IconComp className="h-6 w-6" style={{ color: theme.primaryColor }} />
                </div>

                <h3
                  className="mb-3 text-lg font-black"
                  style={{ color: theme.backgroundColor }}
                >
                  {item.title}
                </h3>

                <p
                  className="text-sm leading-relaxed"
                  style={{ color: `${theme.backgroundColor}bb` }}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
