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
  verticalListSortingStrategy 
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
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar: Block List */}
      <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Seções do Kit</h2>
          <button 
            onClick={handleSaveAll}
            disabled={!isDirty || isPending}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-rose-500 disabled:opacity-50 disabled:bg-gray-400"
          >
            {isPending ? "Salvando..." : (
              <><Save className="h-3 w-3" /> Salvar</>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              {sections.map((section) => (
                <SortableBlockItem 
                  key={section.id} 
                  section={section} 
                  isActive={activeSectionId === section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  onDelete={() => handleDeleteSection(section.id)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {sections.length === 0 && (
            <div className="text-center py-10 text-sm text-gray-400">
              Nenhuma seção adicionada.
            </div>
          )}

          {!showAddMenu ? (
            <button
              onClick={() => setShowAddMenu(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-semibold text-gray-500 transition hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50"
            >
              <Plus className="h-4 w-4" /> Adicionar Bloco
            </button>
          ) : (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 mb-2">Selecione o tipo:</p>
              {["hero", "about", "features", "stats", "testimonials", "contact"].map(t => (
                <button
                  key={t}
                  onClick={() => handleAddBlock(t as MediaKitSectionWithData["tipo"])}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-rose-400 hover:text-rose-600 transition"
                >
                  Bloco: <span className="capitalize">{t}</span>
                </button>
              ))}
              <button 
                onClick={() => setShowAddMenu(false)}
                className="w-full text-center mt-2 text-xs text-gray-400 hover:text-gray-600"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Block Properties */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {activeSection ? (
          <BlockPropertiesPanel 
            section={activeSection} 
            onChange={(updates) => handleUpdateSection(activeSection.id, updates)} 
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm mb-4">
              <MousePointerClick className="h-8 w-8 text-rose-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Nenhum bloco selecionado</h3>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Selecione um bloco na barra lateral para editar seu conteúdo, imagens e configurações.
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
