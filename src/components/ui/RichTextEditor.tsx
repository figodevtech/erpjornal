"use client";

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, Italic, List, ListOrdered, Quote, Link as LinkIcon, 
  Image as ImageIcon, Undo, Redo, Heading1, Heading2, Strikethrough,
  Underline as UnderlineIcon
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('URL da Imagem:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL do Link:', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
        title="Negrito"
      >
        <Bold size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
      >
        <Italic size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('underline') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
      >
        <UnderlineIcon size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('strike') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
      >
        <Strikethrough size={18} />
      </button>

      <div className="w-[1px] h-6 bg-slate-300 mx-1 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
      >
        <Heading1 size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
      >
        <Heading2 size={18} />
      </button>

      <div className="w-[1px] h-6 bg-slate-300 mx-1 self-center" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
      >
        <List size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('orderedList') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
      >
        <ListOrdered size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('blockquote') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
      >
        <Quote size={18} />
      </button>

      <div className="w-[1px] h-6 bg-slate-300 mx-1 self-center" />

      <button
        type="button"
        onClick={setLink}
        className={`p-2 rounded hover:bg-slate-200 ${editor.isActive('link') ? 'bg-slate-200 text-indigo-600' : 'text-slate-600'}`}
        title="Inserir Link"
      >
        <LinkIcon size={18} />
      </button>
      
      <div className="relative group/upload">
        <button
          type="button"
          className="p-2 rounded hover:bg-slate-200 text-slate-600"
          title="Inserir Imagem"
        >
          <ImageIcon size={18} />
        </button>
        <input 
          type="file" 
          accept="image/*"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              if (file.size > 2 * 1024 * 1024) {
                 alert('A imagem é muito grande! O limite é 2MB para inclusão direta no texto.');
                 return;
              }
              const reader = new FileReader();
              reader.onload = (event) => {
                const src = event.target?.result as string;
                editor.chain().focus().setImage({ src }).run();
              };
              reader.onerror = () => {
                alert('Erro ao carregar a imagem selecionada.');
              };
              reader.readAsDataURL(file);
            }
          }}
        />
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded hover:bg-slate-200 text-slate-400 disabled:opacity-30"
      >
        <Undo size={18} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded hover:bg-slate-200 text-slate-400 disabled:opacity-30"
      >
        <Redo size={18} />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      // Se StarterKit não tiver underline ou link (como em versões antigas), 
      // o console vai avisar que eles não existem se eu removesse.
      // Como o console está avisando que eles são DUPLICADOS, significa que o StarterKit já os tem.
      // Vou tentar manter apenas o Link configurado.
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-indigo-600 underline text-red-700 font-bold',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-2xl max-w-full h-auto my-4 shadow-lg mx-auto block',
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
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[350px] p-6 text-lg font-serif leading-relaxed',
      },
    },
  });

  // Sincroniza conteúdo externo (ex: IA reescrever) para o editor
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="w-full bg-slate-50 border-2 border-slate-100 rounded-[24px] focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all overflow-hidden flex flex-col group">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="bg-white overflow-y-auto max-h-[600px] outline-none" />
    </div>
  );
}
