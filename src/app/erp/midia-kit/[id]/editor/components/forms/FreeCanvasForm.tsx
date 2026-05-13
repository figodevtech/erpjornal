"use client";

import { Square, Type, Image as ImageIcon, Layers, Trash2, Move, Maximize, RotateCw, Palette, Type as TypeIcon } from "lucide-react";
import { useState, useRef, useTransition } from "react";
import ImageUploadField from "./ImageUploadField";
import CanvasEditor from "./canvas/CanvasEditor";
import { CanvasElement, MediaKitFreeCanvasData } from "@/types/media-kit";

interface Props {
  mediaKitId: string;
  data: Partial<MediaKitFreeCanvasData>;
  onChange: (data: Partial<MediaKitFreeCanvasData>) => void;
}

export default function FreeCanvasForm({ mediaKitId, data, onChange }: Props) {
  const elements = data.elements || [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, startTransition] = useTransition();

  function addElement(type: CanvasElement['type'], extra?: Partial<CanvasElement>) {
    const newElement: CanvasElement = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: 50,
      y: 50,
      width: type === 'text' ? 200 : 150,
      height: type === 'text' ? 40 : 150,
      rotation: 0,
      zIndex: elements.length,
      content: type === 'text' ? 'Novo Texto' : undefined,
      style: {
        fontSize: 24,
        color: '#000000',
        backgroundColor: type === 'shape' ? '#dc2626' : undefined,
        textAlign: 'left',
        fontWeight: 'bold',
        borderRadius: 0,
        opacity: 1
      },
      ...extra
    };
    onChange({ elements: [...elements, newElement] });
    setSelectedId(newElement.id);
  }

  function handleImageClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("mediaKitId", mediaKitId);
        formData.append("tipo", "image");

        const res = await fetch("/api/midia-kit/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await res.json();
        if (res.ok) {
          addElement('image', { imageUrl: uploadData.url });
        }
      } catch (err) {
        console.error("Erro no upload:", err);
      }
    });
  }

  function updateElement(id: string, updates: Partial<CanvasElement>) {
    onChange({
      elements: elements.map(el => el.id === id ? { ...el, ...updates } : el)
    });
  }

  function updateElementStyle(id: string, styleUpdates: Partial<NonNullable<CanvasElement['style']>>) {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    updateElement(id, {
      style: { ...el.style, ...styleUpdates }
    });
  }

  function removeElement(id: string) {
    onChange({
      elements: elements.filter(el => el.id !== id)
    });
    if (selectedId === id) setSelectedId(null);
  }

  const [zoom, setZoom] = useState(1);
  const [autoScale, setAutoScale] = useState(true);

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div className="space-y-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*" 
      />

      <div className="flex flex-wrap items-center justify-between gap-4 px-6 pt-4">
        <div className="flex gap-2">
          <button
            onClick={() => addElement('text')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm"
          >
            <Type className="h-3.5 w-3.5" /> Texto
          </button>
          <button
            onClick={() => addElement('shape')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-sm"
          >
            <Square className="h-3.5 w-3.5" /> Forma
          </button>
          <button
            onClick={handleImageClick}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-500 transition shadow-sm disabled:opacity-50"
          >
            <ImageIcon className="h-3.5 w-3.5" /> {isUploading ? 'Enviando...' : 'Imagem'}
          </button>
        </div>

        <div className="flex items-center gap-6 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 px-2">
            <Maximize className="h-3.5 w-3.5 text-slate-400" />
            <input 
              type="range" min="0.2" max="1.5" step="0.05" 
              value={zoom} 
              onChange={(e) => {
                setZoom(parseFloat(e.target.value));
                setAutoScale(false);
              }}
              className="w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500" 
            />
            <span className="text-[10px] font-mono text-slate-500 w-8">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="h-4 w-px bg-gray-200" />

          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase mr-2">Altura</label>
            <input 
              type="number" 
              value={data.canvasHeight || 600}
              onChange={(e) => onChange({ canvasHeight: parseInt(e.target.value) || 600 })}
              className="w-16 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-[10px] font-mono text-slate-900 focus:outline-none focus:border-rose-400"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-600 uppercase mr-2">Fundo</label>
            <input 
              type="color" 
              value={data.backgroundColor || '#ffffff'}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="h-5 w-8 rounded border border-gray-200 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="relative bg-slate-100/50 min-h-[500px] overflow-auto scrollbar-hide border-y border-slate-200">
        <div 
          className="flex items-start justify-center p-20 origin-top transition-transform duration-200"
          style={{ 
            transform: `scale(${zoom})`,
            width: `${1280 * zoom}px`,
            margin: '0 auto'
          }}
        >
          <div 
            className="relative rounded-sm border-[12px] border-white bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] overflow-hidden shrink-0" 
            style={{ 
              height: data.canvasHeight || 600,
              width: '1280px',
              backgroundColor: data.backgroundColor || '#ffffff'
            }}
          >
            <CanvasEditor 
              elements={elements}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onChangeElement={updateElement}
              backgroundColor={data.backgroundColor || '#ffffff'}
              canvasHeight={data.canvasHeight || 600}
            />
          </div>
        </div>
      </div>

      {selectedElement && (
        <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-lg flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-rose-500" /> Propriedades: {selectedElement.type.toUpperCase()}
            </span>
            <button 
              onClick={() => removeElement(selectedId!)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition"
            >
              <Trash2 className="h-3 w-3" /> Remover
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase mb-1.5 block">Posição X</label>
              <input type="number" value={selectedElement.x} onChange={(e) => updateElement(selectedId!, { x: parseInt(e.target.value) || 0 })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-slate-900" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase mb-1.5 block">Posição Y</label>
              <input type="number" value={selectedElement.y} onChange={(e) => updateElement(selectedId!, { y: parseInt(e.target.value) || 0 })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-slate-900" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase mb-1.5 block">Largura</label>
              <input type="number" value={selectedElement.width} onChange={(e) => updateElement(selectedId!, { width: parseInt(e.target.value) || 0 })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-slate-900" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase mb-1.5 block">Altura</label>
              <input type="number" value={selectedElement.height} onChange={(e) => updateElement(selectedId!, { height: parseInt(e.target.value) || 0 })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-mono text-slate-900" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
            {/* Rotação e Opacidade */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <RotateCw className="h-3 w-3" /> Rotação: {selectedElement.rotation || 0}°
                </label>
                <input 
                  type="range" min="0" max="360" step="1" 
                  value={selectedElement.rotation || 0} 
                  onChange={(e) => updateElement(selectedId!, { rotation: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500" 
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Opacidade: {Math.round((selectedElement.style?.opacity ?? 1) * 100)}%</label>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={selectedElement.style?.opacity ?? 1} 
                  onChange={(e) => updateElementStyle(selectedId!, { opacity: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500" 
                />
              </div>
            </div>

            {/* Cores e Estilo */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Palette className="h-3 w-3" /> {selectedElement.type === 'text' ? 'Cor do Texto' : 'Cor de Fundo'}
                </label>
                <input 
                  type="color" 
                  value={selectedElement.type === 'text' ? selectedElement.style?.color : selectedElement.style?.backgroundColor || '#000000'} 
                  onChange={(e) => updateElementStyle(selectedId!, selectedElement.type === 'text' ? { color: e.target.value } : { backgroundColor: e.target.value })}
                  className="h-6 w-10 cursor-pointer border-none bg-transparent"
                />
              </div>
              
              {selectedElement.type === 'shape' && (
                <div>
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2 block">Arredondamento: {selectedElement.style?.borderRadius || 0}px</label>
                  <input 
                    type="range" min="0" max="200" step="1" 
                    value={selectedElement.style?.borderRadius || 0} 
                    onChange={(e) => updateElementStyle(selectedId!, { borderRadius: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-rose-500" 
                  />
                </div>
              )}

              {selectedElement.type === 'text' && (
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <TypeIcon className="h-3 w-3" /> Tamanho
                  </label>
                  <input 
                    type="number" 
                    value={selectedElement.style?.fontSize || 24} 
                    onChange={(e) => updateElementStyle(selectedId!, { fontSize: parseInt(e.target.value) || 12 })}
                    className="w-16 rounded-lg border border-gray-200 px-2 py-1 text-xs font-mono"
                  />
                </div>
              )}
            </div>

            {/* Imagem ou Conteúdo */}
            <div>
              {selectedElement.type === 'image' && (
                <ImageUploadField
                  mediaKitId={mediaKitId}
                  label="Substituir Imagem"
                  value={selectedElement.imageUrl || ""}
                  onChange={(url) => updateElement(selectedId!, { imageUrl: url })}
                />
              )}
              {selectedElement.type === 'text' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Alinhamento</label>
                  <div className="flex gap-2">
                    {['left', 'center', 'right'].map(align => (
                      <button
                        key={align}
                        onClick={() => updateElementStyle(selectedId!, { textAlign: align as any })}
                        className={`flex-1 py-2 rounded-xl border text-[10px] font-black uppercase transition ${selectedElement.style?.textAlign === align ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-gray-200 text-slate-600 hover:border-rose-200'}`}
                      >
                        {align === 'left' ? 'Esq' : align === 'center' ? 'Meio' : 'Dir'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
