import { MediaKitStatus } from "@prisma/client";

export type MediaKitSectionType = 
  | 'hero' 
  | 'about' 
  | 'features' 
  | 'stats' 
  | 'testimonials' 
  | 'contact';

export interface MediaKitTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily?: string;
}

// ──── Section Data Types (matching form field names) ────

export interface MediaKitHeroData {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface MediaKitAboutData {
  title?: string;
  content?: string;
  imageUrl?: string;
}

export interface MediaKitFeatureItem {
  title: string;
  description: string;
  icon?: string;
}

export interface MediaKitFeaturesData {
  title?: string;
  items: MediaKitFeatureItem[];
}

export interface MediaKitStatItem {
  value: string;
  label: string;
  suffix?: string;
}

export interface MediaKitStatsData {
  title?: string;
  items: MediaKitStatItem[];
}

export interface MediaKitTestimonialItem {
  quote: string;
  author: string;
  role?: string;
  avatarUrl?: string;
}

export interface MediaKitTestimonialsData {
  title?: string;
  items: MediaKitTestimonialItem[];
}

export interface MediaKitContactData {
  title?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialLinks?: {
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export type SectionDataMap = {
  hero: MediaKitHeroData;
  about: MediaKitAboutData;
  features: MediaKitFeaturesData;
  stats: MediaKitStatsData;
  testimonials: MediaKitTestimonialsData;
  contact: MediaKitContactData;
};

export interface MediaKitWithRelations {
  id: string;
  nome: string;
  slug: string;
  status: MediaKitStatus;
  tema: MediaKitTheme | null;
  idioma: string;
  publicadoEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
  secoes: MediaKitSectionWithData[];
}

export interface MediaKitSectionWithData {
  id: string;
  mediaKitId: string;
  tipo: MediaKitSectionType;
  titulo: string | null;
  ordem: number;
  ativo: boolean;
  data: any;
  criadoEm: Date;
  atualizadoEm?: Date;
}
