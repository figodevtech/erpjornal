import { MediaKitStatus } from "@prisma/client";

export type MediaKitSectionType = 
  | 'hero' 
  | 'about' 
  | 'features' 
  | 'stats' 
  | 'testimonials' 
  | 'advertising'
  | 'free_canvas'
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

export interface MediaKitAdvertisingItem {
  id: string;
  modalidade: string;
  descricao: string;
  imageUrl?: string;
  preco: string;
  destaque: boolean;
}

export interface MediaKitAdvertisingData {
  title?: string;
  subtitle?: string;
  items: MediaKitAdvertisingItem[];
}

export type CanvasElementType = 'text' | 'image' | 'shape';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number; // pixels
  y: number; // pixels
  width: number; // pixels
  height: number; // pixels
  rotation?: number; // degrees
  content?: string;
  imageUrl?: string;
  style?: {
    color?: string;
    fontSize?: number;
    backgroundColor?: string;
    borderRadius?: number;
    textAlign?: 'left' | 'center' | 'right';
    fontWeight?: string;
    fontFamily?: string;
    opacity?: number;
  };
  zIndex: number;
}

export interface MediaKitFreeCanvasData {
  canvasHeight: number; // base height in px
  backgroundColor?: string;
  elements: CanvasElement[];
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
  advertising: MediaKitAdvertisingData;
  free_canvas: MediaKitFreeCanvasData;
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
  data: SectionDataMap[MediaKitSectionType];
  criadoEm: Date;
  atualizadoEm?: Date;
}
