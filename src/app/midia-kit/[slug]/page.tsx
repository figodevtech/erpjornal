import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { prisma } from "@/lib/prisma";
import {
  MediaKitAboutData,
  MediaKitContactData,
  MediaKitFeaturesData,
  MediaKitHeroData,
  MediaKitStatsData,
  MediaKitTestimonialsData,
  MediaKitTheme,
  MediaKitSectionWithData,
} from "@/types/media-kit";

import HeroSection from "./components/HeroSection";
import StatsSection from "./components/StatsSection";
import AboutSection from "./components/AboutSection";
import FeaturesSection from "./components/FeaturesSection";
import TestimonialsSection from "./components/TestimonialsSection";
import ContactSection from "./components/ContactSection";
import MidiaKitHeader from "./components/MidiaKitHeader";
import FloatingCTA from "./components/FloatingCTA";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const kit = await prisma.mediaKit.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: { nome: true, slug: true },
  });

  if (!kit) return { title: "Mídia Kit não encontrado" };

  return {
    title: `${kit.nome} — Revista Gestão`,
    description: `Conheça as oportunidades de anúncio e parceria no ecossistema da Revista Gestão. Mídia Kit ${kit.nome}.`,
    openGraph: {
      title: `${kit.nome} — Revista Gestão`,
      description: "Soluções publicitárias premium para alcançar seu público-alvo.",
      siteName: "Revista Gestão",
    },
  };
}

function renderSection(section: MediaKitSectionWithData, theme: MediaKitTheme) {
  if (!section.ativo) return null;

  const key = `${section.tipo}-${section.id}`;
  const data = section.data ?? {};

  switch (section.tipo) {
    case "hero":
      return <HeroSection key={key} data={data as MediaKitHeroData} theme={theme} />;
    case "stats":
      return <StatsSection key={key} data={data as MediaKitStatsData} theme={theme} />;
    case "about":
      return <AboutSection key={key} data={data as MediaKitAboutData} theme={theme} />;
    case "features":
      return <FeaturesSection key={key} data={data as MediaKitFeaturesData} theme={theme} />;
    case "testimonials":
      return <TestimonialsSection key={key} data={data as MediaKitTestimonialsData} theme={theme} />;
    case "contact":
      return <ContactSection key={key} data={data as MediaKitContactData} theme={theme} />;
    default:
      return null;
  }
}

export default async function MidiaKitPublicPage({ params }: Props) {
  const { slug } = await params;

  const kit = await prisma.mediaKit.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      secoes: {
        where: { ativo: true },
        orderBy: { ordem: "asc" },
      },
    },
  });

  if (!kit) notFound();

  const theme: MediaKitTheme = (kit.tema as unknown as MediaKitTheme) ?? {
    primaryColor: "#dc2626",
    secondaryColor: "#0f172a",
    backgroundColor: "#ffffff",
    textColor: "#0f172a",
  };

  // Build anchor nav items from active sections
  const navItems = kit.secoes
    .filter((s) => s.ativo)
    .map((s) => ({
      id: s.tipo,
      label: s.titulo ?? s.tipo.charAt(0).toUpperCase() + s.tipo.slice(1),
    }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.backgroundColor, color: theme.textColor }}>
      {/* Standalone Header for Mídia Kit */}
      <MidiaKitHeader theme={theme} navItems={navItems} />

      {/* Sections */}
      <main>
        {kit.secoes.map((section) => renderSection(section as MediaKitSectionWithData, theme))}
      </main>

      {/* Floating CTA */}
      <FloatingCTA theme={theme} />

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm" style={{ borderColor: `${theme.primaryColor}22`, color: `${theme.textColor}99` }}>
        <div className="mx-auto max-w-7xl px-6">
          <Link href="/" className="inline-flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <Image src="/logo.png" alt="Revista Gestão" width={120} height={32} className="h-8 w-auto" />
          </Link>
          <p className="mt-3">© {new Date().getFullYear()} Revista Gestão. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
