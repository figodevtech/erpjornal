import Image from "next/image";
import { MediaKitFreeCanvasData, MediaKitTheme } from "@/types/media-kit";

interface Props {
  data: Partial<MediaKitFreeCanvasData>;
  theme: MediaKitTheme;
}

export default function FreeCanvasSection({ data, theme }: Props) {
  const elements = data.elements || [];
  const backgroundColor = data.backgroundColor || 'transparent';
  const canvasHeight = data.canvasHeight || 600;

  return (
    <section 
      className="relative overflow-x-auto w-full scrollbar-hide" 
      id="free-canvas"
      style={{ 
        backgroundColor, 
      }}
    >
      <div 
        className="relative mx-auto" 
        style={{ 
          height: canvasHeight,
          width: '100%',
          maxWidth: '1280px', // Max width of container
          minWidth: '1024px', // Prevents elements from overlapping on mobile by allowing horizontal scroll
        }}
      >
        {elements.map((el) => {
          const style = {
            position: 'absolute' as const,
            left: `${el.x}px`,
            top: `${el.y}px`,
            width: `${el.width}px`,
            height: `${el.height}px`,
            transform: `rotate(${el.rotation || 0}deg)`,
            zIndex: el.zIndex,
            display: 'flex',
            alignItems: 'center',
            justifyContent: el.style?.textAlign === 'left' ? 'flex-start' : el.style?.textAlign === 'right' ? 'flex-end' : 'center',
            opacity: el.style?.opacity ?? 1,
            borderRadius: el.style?.borderRadius ? `${el.style.borderRadius}px` : 0,
            overflow: el.type === 'image' ? 'hidden' : 'visible',
            ...el.style,
          };

          if (el.type === 'text') {
            return (
              <div key={el.id} style={style}>
                <p style={{ 
                  fontSize: el.style?.fontSize ? `${el.style.fontSize}px` : 'inherit',
                  color: el.style?.color || theme.textColor,
                  fontWeight: el.style?.fontWeight || 'normal',
                  textAlign: el.style?.textAlign || 'left',
                  width: '100%',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: el.style?.fontFamily || 'inherit',
                }}>
                  {el.content}
                </p>
              </div>
            );
          }

          if (el.type === 'image' && el.imageUrl) {
            return (
              <div key={el.id} style={style}>
                <Image
                  src={el.imageUrl}
                  alt="Canvas Element"
                  fill
                  className="object-cover"
                />
              </div>
            );
          }

          if (el.type === 'shape') {
            return (
              <div 
                key={el.id} 
                style={{ 
                  ...style, 
                  backgroundColor: el.style?.backgroundColor || theme.primaryColor,
                }} 
              />
            );
          }

          return null;
        })}
      </div>
    </section>
  );
}
