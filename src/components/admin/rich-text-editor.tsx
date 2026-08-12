'use client';

import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewRenderer } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { EditorContent, ReactNodeViewRenderer, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Trash2,
  Underline as UnderlineIcon,
  Undo,
  Video,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface VideoEmbedAttrs {
  src: string;
  type: 'youtube' | 'vimeo' | 'dailymotion' | 'mp4' | 'iframe';
  title?: string;
}

const VideoEmbed = Node.create<VideoEmbedAttrs>({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: '' },
      type: { default: 'iframe' },
      title: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.video-embed[data-video-src]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            src: el.dataset.videoSrc || '',
            type: (el.dataset.videoType as VideoEmbedAttrs['type']) || 'iframe',
            title: el.dataset.videoTitle || '',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, type, title } = HTMLAttributes as Record<string, string>;
    let embedHtml = '';

    if (type === 'youtube') {
      const videoId = src.includes('youtube.com/embed/')
        ? src.split('youtube.com/embed/')[1]?.split('?')[0]
        : src;
      embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>`;
    } else if (type === 'vimeo') {
      embedHtml = `<iframe src="https://player.vimeo.com/video/${src}" allowfullscreen></iframe>`;
    } else if (type === 'dailymotion') {
      embedHtml = `<iframe src="https://www.dailymotion.com/embed/video/${src}" allowfullscreen></iframe>`;
    } else if (type === 'mp4') {
      embedHtml = `<video controls playsinline><source src="${src}" type="video/mp4"></video>`;
    } else {
      embedHtml = `<iframe src="${src}" allowfullscreen></iframe>`;
    }

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: 'video-embed',
        'data-video-src': src,
        'data-video-type': type,
        'data-video-title': title || '',
        style: 'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:24px 0;background:#000;',
      }),
      ['div', { style: 'position:absolute;top:0;left:0;width:100%;height:100%;' }, 0, embedHtml],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedView);
  },
});

import type { NodeViewProps } from '@tiptap/core';

function VideoEmbedView({ node, editor, getPos, updateAttributes, deleteNode }: NodeViewProps) {
  const { src, type, title } = node.attrs as VideoEmbedAttrs;
  const [isHovered, setIsHovered] = useState(false);

  let embedHtml = '';
  if (type === 'youtube') {
    const videoId = src.includes('youtube.com/embed/')
      ? src.split('youtube.com/embed/')[1]?.split('?')[0]
      : src;
    embedHtml = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=0" allowfullscreen style="border:0;"></iframe>`;
  } else if (type === 'vimeo') {
    embedHtml = `<iframe src="https://player.vimeo.com/video/${src}?autoplay=0" allowfullscreen style="border:0;"></iframe>`;
  } else if (type === 'dailymotion') {
    embedHtml = `<iframe src="https://www.dailymotion.com/embed/video/${src}" allowfullscreen style="border:0;"></iframe>`;
  } else if (type === 'mp4') {
    embedHtml = `<video controls playsinline style="width:100%;height:100%;object-fit:contain;"><source src="${src}" type="video/mp4"></video>`;
  } else {
    embedHtml = `<iframe src="${src}" allowfullscreen style="border:0;width:100%;height:100%;"></iframe>`;
  }

  return (
    <div
      className={cn(
        'relative video-embed',
        'rounded-xl overflow-hidden bg-black',
        'my-4',
        'transition-shadow',
        isHovered ? 'shadow-lg ring-2 ring-primary/50' : 'shadow-md'
      )}
      style={{ paddingBottom: '56.25%', height: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute inset-0"
        dangerouslySetInnerHTML={{ __html: embedHtml }}
      />
      {isHovered && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteNode();
            }}
            title="Video'yu sil"
            aria-label="Video'yu sil"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )}
      {title && (
        <div className="absolute bottom-2 left-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded truncate">
          {title}
        </div>
      )}
    </div>
  );
}

function detectVideoType(url: string): VideoEmbedAttrs['type'] {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (url.includes('dailymotion.com') || url.includes('dai.ly')) return 'dailymotion';
  if (/\.(mp4|webm|mov|m3u8)(\?|$)/i.test(url)) return 'mp4';
  return 'iframe';
}

function extractVideoId(url: string, type: VideoEmbedAttrs['type']): string {
  if (type === 'youtube') {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/);
    return match?.[1] || url;
  }
  if (type === 'vimeo') {
    return url.split('/').pop()?.split('?')[0] || url;
  }
  if (type === 'dailymotion') {
    return url.split('/').pop()?.split('?')[0] || url;
  }
  return url;
}

interface MediaPickerProps {
  onInsert: (url: string, type: VideoEmbedAttrs['type'], title?: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MediaPicker({ onInsert, open, onOpenChange }: MediaPickerProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState<{ type: VideoEmbedAttrs['type']; embedUrl: string } | null>(null);
  const [error, setError] = useState('');
  const [isImageMode, setIsImageMode] = useState(false);

  useEffect(() => {
    if (!url.trim()) {
      setPreview(null);
      setError('');
      return;
    }
    const type = detectVideoType(url);
    let embedUrl = '';
    if (type === 'youtube') {
      const id = extractVideoId(url, type);
      embedUrl = `https://www.youtube.com/embed/${id}`;
    } else if (type === 'vimeo') {
      const id = extractVideoId(url, type);
      embedUrl = `https://player.vimeo.com/video/${id}`;
    } else if (type === 'dailymotion') {
      const id = extractVideoId(url, type);
      embedUrl = `https://www.dailymotion.com/embed/video/${id}`;
    } else if (type === 'mp4') {
      embedUrl = url;
    } else {
      embedUrl = url;
    }
    setPreview({ type, embedUrl });
    setError('');
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const type = detectVideoType(url);
    onInsert(url, type, title || undefined);
    setUrl('');
    setTitle('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Medya Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!isImageMode ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setIsImageMode(false)}
              >
                Video
              </Button>
              <Button
                type="button"
                variant={isImageMode ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setIsImageMode(true)}
              >
                Görsel
              </Button>
            </div>

            {!isImageMode && (
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <Input
                  id="video-url"
                  placeholder="YouTube, Vimeo, Dailymotion, MP4 linki..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
            )}

            {isImageMode && (
              <div className="space-y-2">
                <Label htmlFor="image-url">Görsel URL</Label>
                <Input
                  id="image-url"
                  placeholder="https://example.com/image.jpg"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
              </div>
            )}

            {!isImageMode && (
              <div className="space-y-2">
                <Label htmlFor="video-title">Başlık (opsiyonel)</Label>
                <Input
                  id="video-title"
                  placeholder="Video başlığı..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            )}

            {preview && (
              <div className="aspect-video rounded-lg overflow-hidden bg-black border">
                {preview.type === 'mp4' ? (
                  <video controls playsInline style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
                    <source src={preview.embedUrl} type="video/mp4" />
                  </video>
                ) : (
                  <iframe
                    src={preview.embedUrl}
                    style={{ width: '100%', height: '100%', border: 0 }}
                    allowFullScreen
                  />
                )}
              </div>
            )}

            {isImageMode && url && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img src={url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <Separator />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              Ekle
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}

function ToolbarButton({ onClick, isActive, children, title, disabled }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-8 text-slate-700 dark:text-slate-300',
        isActive && 'bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100',
        disabled && 'opacity-50 pointer-events-none'
      )}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder = 'Yazmaya başlayın...', className }: RichTextEditorProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const prevValueRef = useRef<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full my-4' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-blue-600 underline' },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      VideoEmbed,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none min-h-[400px] p-4 focus:outline-none dark:prose-invert',
      },
      handleDOMEvents: {
        drop: (view, event) => {
          event.preventDefault();
          const files = event.dataTransfer?.files;
          if (files && files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const result = e.target?.result as string;
                view.dispatch(view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src: result })
                ));
              };
              reader.readAsDataURL(file);
              return true;
            }
          }
          return false;
        },
        paste: (view, event) => {
          const items = event.clipboardData?.items;
          if (items) {
            for (const item of items) {
              if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const result = e.target?.result as string;
                    view.dispatch(view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src: result })
                    ));
                  };
                  reader.readAsDataURL(file);
                  event.preventDefault();
                  return true;
                }
              }
            }
          }
          return false;
        },
      },
    },
  });

  useEffect(() => {
    if (!editor || value === prevValueRef.current) return;
    prevValueRef.current = value;
    editor.commands.setContent(value, false);
  }, [value, editor]);

  const addImage = () => {
    setMediaPickerOpen(true);
  };

  const addLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL girin:', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) {
    return <div className="border rounded-lg min-h-[400px] animate-pulse bg-muted" />;
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-slate-50 dark:bg-slate-800 p-1.5">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Geri Al (⌘Z)">
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="İleri Al (⌘⇧Z)">
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Kalın (⌘B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="İtalik (⌘I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Altı Çizili (⌘U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Satır İçi Kod"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Başlık 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Başlık 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
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
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Alıntı Bloku"
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

        <ToolbarButton onClick={addLink} title="Bağlantı Ekle (⌘K)">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} title="Medya Ekle (Görsel/Video)">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>

        <MediaPicker
          onInsert={(url, type, title) => {
            editor.chain().focus().insertContent({
              type: 'videoEmbed',
              attrs: { src: extractVideoId(url, type), type, title },
            }).run();
          }}
          open={mediaPickerOpen}
          onOpenChange={setMediaPickerOpen}
        />
      </div>

      <EditorContent editor={editor} className="bg-white dark:bg-slate-900" />
    </div>
  );
}