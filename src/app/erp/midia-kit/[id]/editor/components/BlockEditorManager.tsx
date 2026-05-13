"use client";

import { useState, useMemo, useTransition } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  rectSortingStrategy 
} from "@dnd-kit/sortable";
import { Plus, Save, MousePointerClick } from "lucide-react";

import { MediaKitSectionWithData } from "@/types/media-kit";
import { saveMediaKitSections, updateSectionOrder } from "../../../actions";
import SortableBlockItem from "./SortableBlockItem";
import BlockPropertiesPanel from "./BlockPropertiesPanel";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";

interface Props {
  mediaKitId: string;
  initialSections: MediaKitSectionWithData[];
}

export default function BlockEditorManager({ mediaKitId, initialSections }: Props) {
  const [sections, setSections] = useState<MediaKitSectionWithData[]>(initialSections);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDirty, setIsDirty] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const ids = useMemo(() => sections.map((s) => s.id), [sections]);
  const activeSection = sections.find(s => s.id === activeSectionId) || null;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sections, oldIndex, newIndex).map((s, index) => ({
      ...s,
      ordem: index,
    }));

    setSections(reordered);
    
    // Save order immediately
    startTransition(async () => {
      // Only send real IDs to update order
      const validOrders = reordered
        .filter(s => !s.id.startsWith("temp-"))
        .map(s => ({ id: s.id, ordem: s.ordem }));
      
      if (validOrders.length > 0) {
        await updateSectionOrder(mediaKitId, validOrders);
      }
    });
  }

  function handleAddBlock(tipo: MediaKitSectionWithData["tipo"]) {
    const newSection: MediaKitSectionWithData = {
      id: `temp-${crypto.randomUUID()}`,
      mediaKitId,
      tipo,
      titulo: `Novo bloco ${tipo}`,
      ordem: sections.length,
      ativo: true,
      data: {}, // Será preenchido pelos defaults no BlockPropertiesPanel
      criadoEm: new Date(),
      atualizadoEm: new Date(),
    };
    
    setSections([...sections, newSection]);
    setActiveSectionId(newSection.id);
    setIsDirty(true);
    setShowAddMenu(false);
  }

  function handleUpdateSection(id: string, updates: Partial<MediaKitSectionWithData>) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    setIsDirty(true);
  }

  function handleDeleteSection(id: string) {
    setSectionToDelete(id);
  }

  function confirmDelete() {
    if (!sectionToDelete) return;
    setSections(prev => prev.filter(s => s.id !== sectionToDelete));
    if (activeSectionId === sectionToDelete) setActiveSectionId(null);
    setIsDirty(true);
    setSectionToDelete(null);
  }

  function handleSaveAll() {
    startTransition(async () => {
      try {
        const updatedSections = await saveMediaKitSections(mediaKitId, sections);
        setSections(updatedSections);
        setIsDirty(false);
      } catch (err) {
        alert("Erro ao salvar: " + err);
      }
    });
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-100">
      {/* Top Bar: Block List */}
      <div className="shrink-0 border-b border-gray-200 bg-white z-20 shadow-sm">
        <div className="p-3 flex flex-wrap items-center gap-4">
          <div className="flex-shrink-0 flex items-center gap-3 pr-4 border-r border-gray-100">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Seções</h2>
            <button 
              onClick={handleSaveAll}
              disabled={!isDirty || isPending}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-500 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400"
            >
              {isPending ? "Salvando..." : (
                <><Save className="h-3.5 w-3.5" /> Salvar</>
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={ids} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap items-center gap-2">
                  {sections.map((section) => (
                    <SortableBlockItem 
                      key={section.id} 
                      section={section} 
                      isActive={activeSectionId === section.id}
                      onClick={() => setActiveSectionId(section.id)}
                      onDelete={() => handleDeleteSection(section.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {!showAddMenu ? (
              <button
                onClick={() => setShowAddMenu(true)}
                disabled={isPending}
                className="flex flex-shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-500 transition hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> Novo Bloco
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 bg-rose-50 p-1.5 rounded-2xl border border-rose-100 shadow-sm">
                {[
                  { id: "hero", label: "Hero" },
                  { id: "about", label: "Bio" },
                  { id: "features", label: "Props" },
                  { id: "stats", label: "Dados" },
                  { id: "testimonials", label: "Feed" },
                  { id: "advertising", label: "Pubs" },
                  { id: "free_canvas", label: "Canvas" },
                  { id: "contact", label: "Social" }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleAddBlock(t.id as MediaKitSectionWithData["tipo"])}
                    className="px-3 py-1.5 text-[10px] font-black uppercase tracking-tighter text-rose-600 bg-white border border-rose-200 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                  >
                    {t.label}
                  </button>
                ))}
                <button 
                  onClick={() => setShowAddMenu(false)}
                  className="px-2 py-1 text-[10px] font-bold text-rose-400 hover:text-rose-600"
                >
                  <Plus className="h-4 w-4 rotate-45" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Area: Block Properties */}
      <div className={`flex-1 overflow-y-auto ${activeSection?.tipo === 'free_canvas' ? 'p-0' : 'p-4 sm:p-8'}`}>
        {activeSection ? (
          <div className={`${activeSection.tipo === 'free_canvas' ? 'max-w-none' : 'max-w-[1440px]'} mx-auto`}>
            <BlockPropertiesPanel 
              section={activeSection} 
              onChange={(updates) => handleUpdateSection(activeSection.id, updates)} 
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm mb-4 border border-gray-100">
              <MousePointerClick className="h-8 w-8 text-rose-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Nenhum bloco selecionado</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Selecione um bloco acima para editar seu conteúdo e configurações.
            </p>
          </div>
        )}
      </div>

      <ConfirmationDialog
        open={!!sectionToDelete}
        title="Remover Bloco"
        description="Tem certeza que deseja remover este bloco? Esta ação não pode ser desfeita após salvar as alterações."
        confirmLabel="Remover"
        tone="danger"
        onConfirm={confirmDelete}
        onClose={() => setSectionToDelete(null)}
      />
    </div>
  );
}
