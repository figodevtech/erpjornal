import type { ReactNode } from "react";

type PortalSectionHeaderProps = {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  accentColor?: string;
  badge?: ReactNode;
  children?: ReactNode;
};

export default function PortalSectionHeader({
  eyebrow,
  title,
  description,
  accentColor = "#C4170C",
  badge,
  children,
}: PortalSectionHeaderProps) {
  return (
    <header className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 overflow-hidden border-b border-white/10 bg-gray-950 py-12 text-white shadow-2xl transition-colors md:py-14">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background: `radial-gradient(circle at top right, ${accentColor}33 0%, transparent 35%), linear-gradient(135deg, #09090b 0%, #111827 48%, #1f2937 100%)`,
        }}
      />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-full bg-gradient-to-t from-black/30 to-transparent" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-4xl">
            {eyebrow && (
              <span className="mb-3 block text-[11px] font-black uppercase tracking-[0.24em] text-red-400">
                {eyebrow}
              </span>
            )}

            <div className="mb-3 flex items-start gap-4">
              <span
                className="mt-1 block h-12 w-1.5 shrink-0 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.12)] md:h-16"
                style={{ backgroundColor: accentColor }}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h1 className="text-[34px] font-black uppercase leading-none tracking-tight text-white md:text-[52px]">
                  {title}
                </h1>
                {description && (
                  <p className="mt-4 max-w-3xl text-base font-bold leading-relaxed text-gray-200 md:text-lg">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {badge && (
            <div className="shrink-0 md:pb-1 [&_*]:border-white/10 [&_*]:bg-white/10 [&_*]:text-white [&_*]:backdrop-blur-md">
              {badge}
            </div>
          )}
        </div>

        {children}
      </div>
    </header>
  );
}
