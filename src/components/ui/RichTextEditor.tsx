"use client";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, List, ListOrdered, Quote, 
  Image as ImageIcon, Undo, Redo, Heading1, Heading2,
  Underline as UnderlineIcon, AlignCenter
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

// Extensão Customizada de Imagem para Suportar Tamanhos
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      size: {
        default: 'medium',
        renderHTML: attributes => {
          if (attributes.size === 'small') return { class: 'w-[250px] mx-auto block rounded-2xl shadow-lg my-6' };
          if (attributes.size === 'large') return { class: 'w-[800px] max-w-full mx-auto block rounded-2xl shadow-xl my-8' };
          if (attributes.size === 'full') return { class: 'w-full block rounded-2xl shadow-2xl my-10' };
          return { class: 'w-[500px] max-w-full mx-auto block rounded-2xl shadow-lg my-6' }; // medium
        },
        parseHTML: element => element.getAttribute('data-size') || 'medium',
      },
      align: {
        default: 'center',
        renderHTML: attributes => {
          if (attributes.align === 'left') return { style: 'margin-left: 0; margin-right: auto;' };
          if (attributes.align === 'right') return { style: 'margin-left: auto; margin-right: 0;' };
          return { style: 'margin-left: auto; margin-right: auto;' };
        },
        parseHTML: element => element.getAttribute('data-align') || 'center',
      }
    }
  }
});

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const updateImageSize = (size: 'small' | 'medium' | 'large' | 'full') => {
    editor.chain().focus().updateAttributes('image', { size }).run();
  };

  const updateImageAlign = (align: 'left' | 'center' | 'right') => {
    editor.chain().focus().updateAttributes('image', { align }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-3 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-all rounded-t-3xl">
      <div className="flex bg-gray-100/50 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('bold') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          title="Negrito"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('italic') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('underline') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <UnderlineIcon size={16} />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-gray-200 mx-2" />

      <div className="flex bg-gray-100/50 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Heading2 size={16} />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-gray-200 mx-2" />

      <div className="flex bg-gray-100/50 p-1 rounded-xl gap-0.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('bulletList') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('orderedList') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <ListOrdered size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded-lg transition-all ${editor.isActive('blockquote') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Quote size={16} />
        </button>
      </div>

      <div className="w-[1px] h-4 bg-gray-200 mx-2" />

      <div className="flex bg-gray-100/50 p-1 rounded-xl gap-0.5">
        <div className="relative group/upload">
          <button
            type="button"
            className="p-2 rounded-lg transition-all text-gray-500 hover:text-gray-900"
            title="Inserir Imagem / Redimensionar"
          >
            <ImageIcon size={16} />
          </button>
          <input 
            type="file" 
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  const src = event.target?.result as string;
                  editor.chain().focus().setImage({ src }).run();
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>

        {editor.isActive('image') && (
          <div className="flex items-center gap-0.5 animate-in slide-in-from-left-2 duration-200">
            <div className="w-[1px] h-4 bg-gray-300 mx-1" />
            <button onClick={() => updateImageSize('small')} className="p-2 hover:bg-white rounded-lg text-xs font-bold text-gray-500" title="Pequena">S</button>
            <button onClick={() => updateImageSize('medium')} className="p-2 hover:bg-white rounded-lg text-xs font-bold text-gray-500" title="Média">M</button>
            <button onClick={() => updateImageSize('large')} className="p-2 hover:bg-white rounded-lg text-xs font-bold text-gray-500" title="Grande">L</button>
            <button onClick={() => updateImageSize('full')} className="p-2 hover:bg-white rounded-lg text-xs font-bold text-gray-500" title="Total">XL</button>
            <button onClick={() => updateImageAlign('left')} className="p-2 hover:bg-white rounded-lg text-gray-500"><AlignCenter className="-rotate-90 w-4 h-4" /></button>
            <button onClick={() => updateImageAlign('center')} className="p-2 hover:bg-white rounded-lg text-gray-500"><AlignCenter className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex bg-gray-100/50 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30"
        >
          <Undo size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30"
        >
          <Redo size={16} />
        </button>
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline font-bold transition-all hover:text-blue-800',
        },
      }),
      CustomImage.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full h-auto my-6 shadow-xl mx-auto block cursor-pointer transition-all hover:shadow-2xl',
        },
      }),
    ],
    immediatelyRender: false,
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate prose-lg max-w-none focus:outline-none min-h-[500px] p-8 md:p-12 text-slate-800 font-serif selection:bg-blue-100',
      },
    },
  });

  return (
    <div className="w-full bg-white border border-gray-100 rounded-[32px] focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all overflow-hidden flex flex-col group shadow-sm hover:shadow-md">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="overflow-y-auto max-h-[800px] outline-none" />
    </div>
  );
}

