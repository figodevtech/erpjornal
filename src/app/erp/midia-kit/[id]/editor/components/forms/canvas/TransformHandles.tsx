"use client";

import { RotateCcw } from "lucide-react";

interface Props {
  onResizeStart: (handle: string, e: React.MouseEvent) => void;
  onRotateStart: (e: React.MouseEvent) => void;
}

export default function TransformHandles({ onResizeStart, onRotateStart }: Props) {
  const handles = [
    'top-left', 'top-center', 'top-right',
    'middle-left', 'middle-right',
    'bottom-left', 'bottom-center', 'bottom-right'
  ];

  return (
    <>
      {/* Selection Border */}
      <div className="absolute -inset-1 border-2 border-rose-500 rounded-sm pointer-events-none shadow-[0_0_10px_rgba(244,63,94,0.3)] animate-in fade-in zoom-in-95 duration-200" />

      {/* Resize Handles */}
      {handles.map(handle => (
        <div
          key={handle}
          className="absolute z-[100]"
          style={getHandlePosition(handle)}
        >
          {/* Hit area (larger for touch/easy clicking) */}
          <div 
            className={`w-6 h-6 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer ${getHandleCursor(handle)}`}
            onMouseDown={(e) => {
              e.stopPropagation();
              onResizeStart(handle, e);
            }}
          >
            {/* Visual handle */}
            <div className="w-3 h-3 bg-white border-2 border-rose-500 rounded-full shadow-md hover:scale-125 transition-transform" />
          </div>
        </div>
      ))}

      {/* Rotation Handle */}
      <div 
        className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0 group cursor-alias z-[100]"
        onMouseDown={(e) => {
          e.stopPropagation();
          onRotateStart(e);
        }}
      >
        <div className="w-0.5 h-8 bg-rose-500 shadow-sm" />
        <div className="w-10 h-10 rounded-full bg-white border-2 border-rose-500 flex items-center justify-center shadow-xl group-hover:bg-rose-500 group-hover:text-white transition-all transform group-active:scale-90">
          <RotateCcw className="h-5 w-5 text-rose-500 group-hover:text-white transition-colors" />
        </div>
      </div>
    </>
  );
}

function getHandlePosition(handle: string): React.CSSProperties {
  switch (handle) {
    case 'top-left': return { top: 0, left: 0 };
    case 'top-center': return { top: 0, left: '50%' };
    case 'top-right': return { top: 0, left: '100%' };
    case 'middle-left': return { top: '50%', left: 0 };
    case 'middle-right': return { top: '50%', left: '100%' };
    case 'bottom-left': return { top: '100%', left: 0 };
    case 'bottom-center': return { top: '100%', left: '50%' };
    case 'bottom-right': return { top: '100%', left: '100%' };
    default: return {};
  }
}

function getHandleCursor(handle: string): string {
  switch (handle) {
    case 'top-left': case 'bottom-right': return 'cursor-nwse-resize';
    case 'top-right': case 'bottom-left': return 'cursor-nesw-resize';
    case 'top-center': case 'bottom-center': return 'cursor-ns-resize';
    case 'middle-left': case 'middle-right': return 'cursor-ew-resize';
    default: return 'cursor-pointer';
  }
}
