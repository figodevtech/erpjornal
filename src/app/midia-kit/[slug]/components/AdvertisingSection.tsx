import Image from "next/image";
import { MediaKitAdvertisingData, MediaKitTheme } from "@/types/media-kit";

interface Props {
  data: Partial<MediaKitAdvertisingData>;
  theme: MediaKitTheme;
}

export default function AdvertisingSection({ data, theme }: Props) {
  const items = data.items || [];

  return (
    <section className="py-24 px-6 relative overflow-hidden" id="advertising">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          {data.title && (
            <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ color: theme.secondaryColor }}>
              {data.title}
            </h2>
          )}
          {data.subtitle && (
            <p className="text-lg md:text-xl opacity-70 max-w-2xl mx-auto font-medium">
              {data.subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div 
              key={item.id || index}
              className={`group relative rounded-3xl border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden flex flex-col ${
                item.destaque 
                  ? 'border-2 scale-105 z-10 shadow-xl' 
                  : 'border-gray-100 bg-white'
              }`}
              style={{ 
                borderColor: item.destaque ? theme.primaryColor : undefined,
                backgroundColor: item.destaque ? 'white' : undefined
              }}
            >
              {item.destaque && (
                <div 
                  className="absolute top-4 right-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest z-20 shadow-lg"
                  style={{ backgroundColor: theme.primaryColor, color: 'white' }}
                >
                  Recomendado
                </div>
              )}

              {item.imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.modalidade}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}

              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-black mb-3" style={{ color: theme.secondaryColor }}>
                  {item.modalidade}
                </h3>
                <p className="text-sm opacity-60 leading-relaxed mb-6 flex-1">
                  {item.descricao}
                </p>
                <div className="flex items-end justify-between mt-auto">
                  <div>
                    <span className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Investimento</span>
                    <span className="text-2xl font-black" style={{ color: theme.primaryColor }}>
                      {item.preco}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
