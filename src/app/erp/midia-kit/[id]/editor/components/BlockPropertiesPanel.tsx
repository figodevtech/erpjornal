"use client";

import { Eye, EyeOff } from "lucide-react";
import { 
  MediaKitSectionWithData,
  MediaKitHeroData,
  MediaKitAboutData,
  MediaKitFeaturesData,
  MediaKitStatsData,
  MediaKitTestimonialsData,
  MediaKitContactData
} from "@/types/media-kit";
import HeroForm from "./forms/HeroForm";
import AboutForm from "./forms/AboutForm";
import FeaturesForm from "./forms/FeaturesForm";
import StatsForm from "./forms/StatsForm";
import TestimonialsForm from "./forms/TestimonialsForm";
import ContactForm from "./forms/ContactForm";

interface Props {
  section: MediaKitSectionWithData;
  onChange: (updates: Partial<MediaKitSectionWithData>) => void;
}

export default function BlockPropertiesPanel({ section, onChange }: Props) {
  function handleDataChange(newData: Record<string, unknown>) {
    onChange({ data: { ...section.data, ...newData } });
  }

  // Render specific form based on type
  const renderSpecificForm = () => {
    switch (section.tipo) {
      case "hero":
        return <HeroForm data={section.data as MediaKitHeroData} onChange={handleDataChange} mediaKitId={section.mediaKitId} />;
      case "about":
        return <AboutForm data={section.data as MediaKitAboutData} onChange={handleDataChange} mediaKitId={section.mediaKitId} />;
      case "features":
        return <FeaturesForm data={section.data as MediaKitFeaturesData} onChange={handleDataChange} mediaKitId={section.mediaKitId} />;
      case "stats":
        return <StatsForm data={section.data as MediaKitStatsData} onChange={handleDataChange} mediaKitId={section.mediaKitId} />;
      case "testimonials":
        return <TestimonialsForm data={section.data as MediaKitTestimonialsData} onChange={handleDataChange} mediaKitId={section.mediaKitId} />;
      case "contact":
        return <ContactForm data={section.data as MediaKitContactData} onChange={handleDataChange} mediaKitId={section.mediaKitId} />;
      default:
        return <p className="text-sm text-gray-500">Tipo de bloco desconhecido.</p>;
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Editar {section.tipo}</h2>
          <p className="mt-1 text-sm text-gray-500">Ajuste os campos para este bloco.</p>
        </div>
        
        <button
          onClick={() => onChange({ ativo: !section.ativo })}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
            section.ativo 
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          {section.ativo ? (
            <><Eye className="h-4 w-4" /> Visível</>
          ) : (
            <><EyeOff className="h-4 w-4" /> Oculto</>
          )}
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h3 className="text-base font-bold text-gray-900">Configuração Geral</h3>
        
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-gray-900">Título Interno (apenas para o painel)</label>
          <input
            type="text"
            value={section.titulo ?? ""}
            onChange={(e) => onChange({ titulo: e.target.value })}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-100"
            placeholder="Ex: Hero Inicial"
          />
        </div>
      </div>

      {/* Specific Form Fields */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-5 text-base font-bold text-gray-900">Conteúdo do Bloco</h3>
        {renderSpecificForm()}
      </div>
    </div>
  );
}
