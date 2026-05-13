import { MediaKitContactData, MediaKitTheme } from "@/types/media-kit";
import { Mail, Phone, MapPin, Send } from "lucide-react";

function InstagramIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function LinkedinIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function YoutubeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

interface Props {
  data: MediaKitContactData;
  theme: MediaKitTheme;
}

export default function ContactSection({ data, theme }: Props) {
  const hasLinks = data.socialLinks && Object.values(data.socialLinks).some(Boolean);

  return (
    <section
      id="section-contact"
      className="relative py-20 lg:py-28"
      style={{ backgroundColor: theme.secondaryColor }}
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full opacity-10 blur-[100px]"
          style={{ backgroundColor: theme.primaryColor }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Info */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-12" style={{ backgroundColor: theme.primaryColor }} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: theme.primaryColor }}>
                Contato Comercial
              </span>
            </div>

            <h2
              className="mb-6 font-serif text-3xl font-black tracking-tight md:text-4xl"
              style={{ color: theme.backgroundColor }}
            >
              {data.title || "Vamos conversar sobre sua campanha"}
            </h2>

            <p className="mb-10 max-w-md text-lg leading-relaxed" style={{ color: `${theme.backgroundColor}bb` }}>
              Fale com nosso time comercial para conhecer os formatos ideais para sua marca e receber uma proposta personalizada.
            </p>

            {/* Contact Info */}
            <div className="space-y-5">
              {data.email && (
                <a
                  href={`mailto:${data.email}`}
                  className="flex items-center gap-4 transition-opacity hover:opacity-80"
                  style={{ color: theme.backgroundColor }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${theme.primaryColor}22` }}>
                    <Mail className="h-5 w-5" style={{ color: theme.primaryColor }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60">Email</p>
                    <p className="text-base font-bold">{data.email}</p>
                  </div>
                </a>
              )}

              {data.phone && (
                <a
                  href={`tel:${data.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-4 transition-opacity hover:opacity-80"
                  style={{ color: theme.backgroundColor }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `${theme.primaryColor}22` }}>
                    <Phone className="h-5 w-5" style={{ color: theme.primaryColor }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60">Telefone / WhatsApp</p>
                    <p className="text-base font-bold">{data.phone}</p>
                  </div>
                </a>
              )}

              {data.address && (
                <div className="flex items-start gap-4" style={{ color: theme.backgroundColor }}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${theme.primaryColor}22` }}>
                    <MapPin className="h-5 w-5" style={{ color: theme.primaryColor }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-60">Endereço</p>
                    <p className="text-base font-bold">{data.address}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social links */}
            {hasLinks && (
              <div className="mt-10 flex items-center gap-3">
                {data.socialLinks?.instagram && (
                  <a
                    href={data.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition-all hover:scale-110"
                    style={{ borderColor: `${theme.backgroundColor}22`, color: theme.backgroundColor }}
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="h-5 w-5" />
                  </a>
                )}
                {data.socialLinks?.linkedin && (
                  <a
                    href={data.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition-all hover:scale-110"
                    style={{ borderColor: `${theme.backgroundColor}22`, color: theme.backgroundColor }}
                    aria-label="LinkedIn"
                  >
                    <LinkedinIcon className="h-5 w-5" />
                  </a>
                )}
                {data.socialLinks?.youtube && (
                  <a
                    href={data.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border transition-all hover:scale-110"
                    style={{ borderColor: `${theme.backgroundColor}22`, color: theme.backgroundColor }}
                    aria-label="YouTube"
                  >
                    <YoutubeIcon className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Right: Quick Form */}
          <div className="flex items-center">
            <div
              className="w-full rounded-2xl border p-8 shadow-xl lg:p-10"
              style={{
                backgroundColor: theme.backgroundColor,
                borderColor: `${theme.textColor}11`,
              }}
            >
              <h3 className="mb-6 text-xl font-black" style={{ color: theme.textColor }}>
                Solicite uma proposta
              </h3>

              <form className="space-y-4" action={`mailto:${data.email || "comercial@revistagestao.com.br"}`} method="POST" encType="text/plain">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold" style={{ color: theme.textColor }}>
                    Nome
                  </label>
                  <input
                    type="text"
                    name="nome"
                    placeholder="Seu nome completo"
                    className="w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: `${theme.textColor}22`,
                      color: theme.textColor,
                      backgroundColor: `${theme.textColor}05`,
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold" style={{ color: theme.textColor }}>
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="seu@email.com"
                    className="w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: `${theme.textColor}22`,
                      color: theme.textColor,
                      backgroundColor: `${theme.textColor}05`,
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold" style={{ color: theme.textColor }}>
                    Empresa
                  </label>
                  <input
                    type="text"
                    name="empresa"
                    placeholder="Nome da empresa ou agência"
                    className="w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: `${theme.textColor}22`,
                      color: theme.textColor,
                      backgroundColor: `${theme.textColor}05`,
                    }}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold" style={{ color: theme.textColor }}>
                    Mensagem (Opcional)
                  </label>
                  <textarea
                    name="mensagem"
                    placeholder="Conte brevemente o que procura..."
                    rows={3}
                    className="w-full resize-none rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
                    style={{
                      borderColor: `${theme.textColor}22`,
                      color: theme.textColor,
                      backgroundColor: `${theme.textColor}05`,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-base font-bold transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                  style={{ backgroundColor: theme.primaryColor, color: "#fff" }}
                >
                  <Send className="h-4 w-4" />
                  Enviar Solicitação
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
