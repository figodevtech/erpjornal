import { Prisma } from "@prisma/client";

import { MediaKitSectionType, MediaKitSectionWithData } from "@/types/media-kit";

const MEDIA_KIT_SECTION_TYPES = [
  "hero",
  "about",
  "features",
  "stats",
  "testimonials",
  "contact",
] as const satisfies readonly MediaKitSectionType[];

function isMediaKitSectionType(value: string): value is MediaKitSectionType {
  return (MEDIA_KIT_SECTION_TYPES as readonly string[]).includes(value);
}

export function toMediaKitSectionWithData(section: {
  id: string;
  mediaKitId: string;
  tipo: string;
  titulo: string | null;
  ordem: number;
  ativo: boolean;
  data: Prisma.JsonValue;
  criadoEm: Date;
}): MediaKitSectionWithData {
  if (!isMediaKitSectionType(section.tipo)) {
    throw new Error(`Tipo de secao de midia kit invalido: ${section.tipo}`);
  }

  return {
    id: section.id,
    mediaKitId: section.mediaKitId,
    tipo: section.tipo,
    titulo: section.titulo,
    ordem: section.ordem,
    ativo: section.ativo,
    data: section.data as MediaKitSectionWithData["data"],
    criadoEm: section.criadoEm,
  };
}
