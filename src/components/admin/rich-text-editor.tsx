'use client';

import { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Code,
  Undo,
  Redo,
  Video,
} from 'lucide-react';

// Regex to find video embed HTML blocks (div.video-embed, iframe, video tags)
const VIDEO_BLOCK_REGEX = /<(?:div|iframe|video)[^>]*(?:video-embed|youtube|vimeo|dailymotion|bloomberg)[^>]*>[\s\S]*?<\/(?:div|iframe|video)>/g;
const IFRAME_REGEX = /<iframe[\s\S]*?<\/iframe>/g;
const VIDEO_TAG_REGEX = /<video[\s\S]*?<\/video>/g;
const VIDEO_EMBED_DIV_REGEX = /<div class="video-embed"[\s\S]*?<\/div>/g;

const PLACEHOLDER_PREFIX = '<!--RTE_VIDEO_';
const PLACEHOLDER_END = '-->';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Yazmaya başlayın...',
  className,
}: RichTextEditorProps) {
  // Ref to store video blocks for restoration
  const videoBlocksRef = useRef<string[]>([]);

  // Extract video/iframe HTML blocks and replace with placeholders
  const extractVideoBlocks = useCallback((html: string): string => {
    if (!html) return '';
    videoBlocksRef.current = [];

    // Extract video-embed divs
    let result = html.replace(VIDEO_EMBED_DIV_REGEX, (match) => {
      const idx = videoBlocksRef.current.length;
      videoBlocksRef.current.push(match);
      return `${PLACEHOLDER_PREFIX}V${idx}${PLACEHOLDER_END}`;
    });

    // Extract iframes
    result = result.replace(IFRAME_REGEX, (match) => {
      const idx = videoBlocksRef.current.length;
      videoBlocksRef.current.push(match);
      return `${PLACEHOLDER_PREFIX}I${idx}${PLACEHOLDER_END}`;
    });

    // Extract video tags
    result = result.replace(VIDEO_TAG_REGEX, (match) => {
      const idx = videoBlocksRef.current.length;
      videoBlocksRef.current.push(match);
      return `${PLACEHOLDER_PREFIX}T${idx}${PLACEHOLDER_END}`;
    });

    return result;
  }, []);

  // Restore video blocks from placeholders
  const restoreVideoBlocks = useCallback((html: string): string => {
    if (!html || videoBlocksRef.current.length === 0) return html;
    return html.replace(
      new RegExp(
        `${PLACEHOLDER_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[VTIdI](\\d+)${PLACEHOLDER_END.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        'g'
      ),
      (_, idx) => {
        const index = parseInt(idx, 10);
        return videoBlocksRef.current[index] || '';
      }
    );
  }, []);

  const sanitizedValue = extractVideoBlocks(value || '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: sanitizedValue,
    onUpdate: ({ editor }) => {
      const rawHtml = editor.getHTML();
      const restored = restoreVideoBlocks(rawHtml);
      onChange(restored);
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose max-w-none min-h-[300px] p-4 focus:outline-none dark:prose-invert',
      },
    },
  });

  if (!editor) {
    return (
      <div className="border rounded-lg min-h-[400px] animate-pulse bg-muted" />
    );
  }

  const addImage = () => {
    const url = window.prompt("Görsel URL'si girin:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL girin:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addVideo = () => {
    const url = window.prompt("Video URL'si girin (MP4, YouTube, Vimeo, vs.):");
    if (!url) return;

    let embedHtml = '';

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    if (ytMatch) {
      embedHtml = `<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:24px 0;"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    }
    // Vimeo
    else if (url.includes('vimeo.com')) {
      const vimeoId = url.split('/').pop();
      embedHtml = `<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:24px 0;"><iframe src="https://player.vimeo.com/video/${vimeoId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    }
    // Dailymotion
    else if (url.includes('dailymotion.com') || url.includes('dai.ly')) {
      const dmId = url.split('/').pop()?.split('?')[0];
      embedHtml = `<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:24px 0;"><iframe src="https://www.dailymotion.com/embed/video/${dmId}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    }
    // Direct video (mp4, webm, m3u8)
    else if (/\.(mp4|webm|flv|m3u8|mov)(\?|$)/i.test(url)) {
      const ext = url.match(/\.(mp4|webm|flv|m3u8|mov)/i)?.[1]?.toLowerCase() || 'mp4';
      const mime = ext === 'webm' ? 'video/webm' : ext === 'flv' ? 'video/x-flv' : ext === 'm3u8' ? 'application/x-mpegURL' : ext === 'mov' ? 'video/quicktime' : 'video/mp4';
      embedHtml = `<div class="video-embed" style="margin:24px 0;border-radius:12px;overflow:hidden;"><video controls style="width:100%;" playsinline><source src="${url}" type="${mime}">Tarayıcınız video desteklemiyor.</video></div>`;
    }
    // Generic iframe
    else {
      embedHtml = `<div class="video-embed" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:24px 0;"><iframe src="${url}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allowfullscreen></iframe></div>`;
    }

    // Insert video embed at cursor position
    editor.chain().focus().insertContent(embedHtml).run();
  };

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-8 text-slate-700 dark:text-slate-300',
        isActive && 'bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100'
      )}
      onClick={onClick}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-slate-50 dark:bg-slate-800 p-1.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Geri Al"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="İleri Al"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Kalın"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="İtalik"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Altı Çizili"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive('heading', { level: 1 })}
          title="Başlık 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive('heading', { level: 2 })}
          title="Başlık 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive('heading', { level: 3 })}
          title="Başlık 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Madde Listesi"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numaralı Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Sola Hizala"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Ortala"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Sağa Hizala"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="İki Yana Yasla"
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Alıntı"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Kod Bloğu"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <ToolbarButton onClick={addLink} title="Bağlantı Ekle">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Görsel Ekle">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addVideo} title="Video Ekle">
          <Video className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="bg-white dark:bg-slate-900" />
    </div>
  );
}
