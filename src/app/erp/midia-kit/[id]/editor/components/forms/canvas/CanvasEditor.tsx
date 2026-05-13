"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { CanvasElement } from "@/types/media-kit";
import TransformHandles from "./TransformHandles";

interface Props {
  elements: CanvasElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChangeElement: (id: string, updates: Partial<CanvasElement>) => void;
  backgroundColor: string;
  canvasHeight: number;
}

type InteractionType = 'moving' | 'resizing' | 'rotating' | null;

export default function CanvasEditor({ elements, selectedId, onSelect, onChangeElement, backgroundColor, canvasHeight }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [interaction, setInteraction] = useState<InteractionType>(null);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0, elX: 0, elY: 0, elW: 0, elH: 0, elR: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedElement = elements.find(el => el.id === selectedId);

  const handleMouseDown = (e: React.MouseEvent, el: CanvasElement) => {
    if (editingId === el.id) return;
    
    e.stopPropagation();
    onSelect(el.id);
    setInteraction('moving');
    setStartPos({
      x: e.clientX,
      y: e.clientY,
      elX: el.x,
      elY: el.y,
      elW: el.width,
      elH: el.height,
      elR: el.rotation || 0
    });
  };

  const handleResizeStart = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInteraction('resizing');
    setActiveHandle(handle);
    if (selectedElement) {
      setStartPos({
        x: e.clientX,
        y: e.clientY,
        elX: selectedElement.x,
        elY: selectedElement.y,
        elW: selectedElement.width,
        elH: selectedElement.height,
        elR: selectedElement.rotation || 0
      });
    }
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInteraction('rotating');
    if (selectedElement && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + selectedElement.x + selectedElement.width / 2;
      const centerY = rect.top + selectedElement.y + selectedElement.height / 2;
      setStartPos({
        x: centerX,
        y: centerY,
        elX: selectedElement.x,
        elY: selectedElement.y,
        elW: selectedElement.width,
        elH: selectedElement.height,
        elR: selectedElement.rotation || 0
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interaction || !selectedId || !selectedElement) return;

    if (interaction === 'moving') {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      onChangeElement(selectedId, {
        x: Math.round(startPos.elX + dx),
        y: Math.round(startPos.elY + dy)
      });
    } else if (interaction === 'resizing' && activeHandle) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      
      let newX = startPos.elX;
      let newY = startPos.elY;
      let newW = startPos.elW;
      let newH = startPos.elH;

      if (activeHandle.includes('right')) newW = Math.max(10, startPos.elW + dx);
      if (activeHandle.includes('left')) {
        const delta = Math.min(dx, startPos.elW - 10);
        newX = startPos.elX + delta;
        newW = startPos.elW - delta;
      }
      if (activeHandle.includes('bottom')) newH = Math.max(10, startPos.elH + dy);
      if (activeHandle.includes('top')) {
        const delta = Math.min(dy, startPos.elH - 10);
        newY = startPos.elY + delta;
        newH = startPos.elH - delta;
      }

      onChangeElement(selectedId, { x: newX, y: newY, width: newW, height: newH });
    } else if (interaction === 'rotating') {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      onChangeElement(selectedId, { rotation: Math.round(angle) });
    }
  };

  const handleMouseUp = () => {
    setInteraction(null);
    setActiveHandle(null);
  };

  const handleDoubleClick = (id: string) => {
    const el = elements.find(e => e.id === id);
    if (el?.type === 'text') {
      setEditingId(id);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editingId && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setEditingId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingId]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full select-none outline-none overflow-hidden cursor-crosshair" 
      style={{ backgroundColor }}
      onMouseDown={(e) => { 
        if (e.target === containerRef.current) {
          onSelect(null); 
          setEditingId(null); 
        }
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Grid Helper */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {elements
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((el) => {
          const isSelected = el.id === selectedId;
          const isEditing = el.id === editingId;
          const style: React.CSSProperties = {
            position: 'absolute',
            left: `${el.x}px`,
            top: `${el.y}px`,
            width: `${el.width}px`,
            height: `${el.height}px`,
            zIndex: el.zIndex,
            display: 'flex',
            alignItems: 'center',
            justifyContent: el.style?.textAlign === 'left' ? 'flex-start' : el.style?.textAlign === 'right' ? 'flex-end' : 'center',
            outline: isSelected ? '2px solid #f43f5e' : 'none',
            outlineOffset: '2px',
            cursor: interaction ? 'grabbing' : 'grab',
            transform: `rotate(${el.rotation || 0}deg)`,
            opacity: el.style?.opacity ?? 1,
            transition: interaction ? 'none' : 'outline 0.2s, transform 0.2s',
            ...el.style,
          };

          return (
            <div 
              key={el.id} 
              style={style}
              className={`group ${!isSelected ? 'hover:outline-[1px] hover:outline-dashed hover:outline-rose-300' : ''}`}
              onMouseDown={(e) => handleMouseDown(e, el)}
              onDoubleClick={() => handleDoubleClick(el.id)}
            >
              {el.type === 'text' && (
                isEditing ? (
                  <textarea
                    autoFocus
                    value={el.content}
                    onChange={(e) => onChangeElement(el.id, { content: e.target.value })}
                    className="w-full h-full bg-transparent border-none outline-none resize-none overflow-hidden p-0"
                    style={{
                      fontSize: el.style?.fontSize ? `${el.style.fontSize}px` : '16px',
                      color: el.style?.color || '#000000',
                      fontWeight: el.style?.fontWeight || 'normal',
                      textAlign: el.style?.textAlign || 'left',
                      fontFamily: el.style?.fontFamily || 'inherit',
                      lineHeight: '1.2'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="w-full break-words select-none" style={{ 
                    fontSize: el.style?.fontSize ? `${el.style.fontSize}px` : '16px',
                    color: el.style?.color || '#000000',
                    fontWeight: el.style?.fontWeight || 'normal',
                    textAlign: el.style?.textAlign || 'left',
                    fontFamily: el.style?.fontFamily || 'inherit',
                    pointerEvents: 'none',
                    margin: 0
                  }}>
                    {el.content}
                  </p>
                )
              )}

              {el.type === 'image' && el.imageUrl && (
                <div className="relative w-full h-full pointer-events-none select-none">
                  <Image
                    src={el.imageUrl}
                    alt="Canvas Element"
                    fill
                    className="object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
              )}

              {el.type === 'shape' && (
                <div 
                  className="w-full h-full pointer-events-none"
                  style={{ 
                    backgroundColor: el.style?.backgroundColor || '#ccc',
                    borderRadius: el.style?.borderRadius ? `${el.style.borderRadius}px` : 0
                  }} 
                />
              )}
              
              {isSelected && !isEditing && (
                <TransformHandles 
                  onResizeStart={handleResizeStart}
                  onRotateStart={handleRotateStart}
                />
              )}
            </div>
          );
      })}
    </div>
  );
}
