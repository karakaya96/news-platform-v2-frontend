'use client';

import type { NodeViewProps } from '@tiptap/core';
import { mergeAttributes, Node } from '@tiptap/core';
import Highlight from '@tiptap/extension-highlight';
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
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo,
  RemoveFormatting,
  Sparkles,
  Trash2,
  Underline as UnderlineIcon,
  Undo,
  Video,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

/* ──────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */

interface VideoEmbedAttrs {
  src: string;
  type: 'youtube' | 'vimeo' | 'dailymotion' | 'mp4' | 'iframe';
  title?: string;
}

/* ──────────────────────────────────────────────────────────
   URL Validation & Sanitization
   ────────────────────────────────────────────────────────── */

function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return parsed.href;
  } catch {
    return '';
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
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
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]+)/
    );
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

function buildEmbedUrl(src: string, type: VideoEmbedAttrs['type']): string | null {
  const safeSrc = escapeHtml(src);
  switch (type) {
    case 'youtube':
      return `https://www.youtube.com/embed/${safeSrc}?rel=0`;
    case 'vimeo':
      return `https://player.vimeo.com/video/${safeSrc}?byline=0&portrait=0`;
    case 'dailymotion':
      return `https://www.dailymotion.com/embed/video/${safeSrc}`;
    case 'mp4':
      return sanitizeUrl(src);
    case 'iframe':
      return sanitizeUrl(src);
    default:
      return null;
  }
}

/* ──────────────────────────────────────────────────────────
   VideoEmbed TipTap Node
   ────────────────────────────────────────────────────────── */

const VideoEmbed = Node.create<VideoEmbedAttrs>({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: '' },
      type: { default: 'iframe' as VideoEmbedAttrs['type'] },
      title: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video-embed]',
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
    const embedUrl = buildEmbedUrl(src, type as VideoEmbedAttrs['type']);

    if (!embedUrl) {
      return [
        'div',
        mergeAttributes(HTMLAttributes, { 'data-video-embed': '' }),
        ['p', { class: 'text-red-500 text-sm' }, 'Geçersiz video URL'],
      ];
    }

    const safeTitle = escapeHtml(title || '');
    const innerContent =
      type === 'mp4'
        ? [
            'video',
            { controls: '', playsinline: '', class: 'w-full h-full object-contain' },
            ['source', { src: embedUrl, type: 'video/mp4' }],
          ]
        : ['iframe', { src: embedUrl, allowfullscreen: '', class: 'border-0', loading: 'lazy' }];

    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-video-embed': '',
        'data-video-src': src,
        'data-video-type': type,
        'data-video-title': title || '',
        class: 'video-embed-wrapper',
        style:
          'position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:24px 0;background:#0f172a;',
      }),
      [
        'div',
        { style: 'position:absolute;top:0;left:0;width:100%;height:100%;' },
        ...(Array.isArray(innerContent) ? [innerContent] : []),
      ],
      ...(safeTitle
        ? [
            [
              'div',
              {
                style:
                  'position:absolute;bottom:0;left:0;right:0;padding:8px 12px;background:linear-gradient(transparent,rgba(0,0,0,0.8));color:white;font-size:12px;border-radius:0 0 12px 12px;',
              },
              safeTitle,
            ],
          ]
        : []),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedView);
  },
});

/* ──────────────────────────────────────────────────────────
   VideoEmbedView (React NodeView)
   ────────────────────────────────────────────────────────── */

function VideoEmbedView({ node, deleteNode }: NodeViewProps) {
  const { src, type, title } = node.attrs as VideoEmbedAttrs;
  const [isHovered, setIsHovered] = useState(false);

  const embedUrl = useMemo(() => buildEmbedUrl(src, type), [src, type]);

  if (!embedUrl) {
    return (
      <div className="my-4 rounded-xl border border-dashed border-red-300 bg-red-50 p-4 text-center dark:bg-red-950/30">
        <p className="text-sm text-red-600 dark:text-red-400">Geersiz video URL</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative my-4 group/video rounded-xl overflow-hidden',
        'transition-all duration-200',
        isHovered ? 'ring-2 ring-primary/40 shadow-xl' : 'shadow-lg'
      )}
      style={{ paddingBottom: '56.25%', height: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Content */}
      <div className="absolute inset-0">
        {type === 'mp4' ? (
          // biome-ignore lint/a11y/useMediaCaption: Admin video embed
          <video controls playsInline preload="metadata" className="w-full h-full object-contain">
            <source src={embedUrl} type="video/mp4" />
          </video>
        ) : (
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            title={title || 'Video'}
          />
        )}
      </div>

      {/* Delete Button */}
      {isHovered && (
        <div className="absolute top-3 right-3 z-10 flex gap-1.5 animate-in fade-in duration-150">
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8 rounded-full shadow-lg backdrop-blur-sm bg-red-500/90 hover:bg-red-600"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              deleteNode();
            }}
            title="Videoyu sil"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Title Bar */}
      {title && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-3">
          <div className="flex items-center gap-2">
            <Video className="h-3.5 w-3.5 text-white/70 shrink-0" />
            <span className="text-xs text-white/90 font-medium truncate">{escapeHtml(title)}</span>
          </div>
        </div>
      )}

      {/* Type Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/80 uppercase tracking-wider backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          {type === 'mp4' ? 'MP4' : type}
        </span>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   LinkDialog
   ────────────────────────────────────────────────────────── */

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (url: string, text?: string) => void;
  initialUrl?: string;
  initialText?: string;
}

function LinkDialog({
  open,
  onOpenChange,
  onInsert,
  initialUrl = '',
  initialText = '',
}: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [error, setError] = useState('');
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setText(initialText);
      setError('');
      setTimeout(() => urlRef.current?.focus(), 100);
    }
  }, [open, initialUrl, initialText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('URL gerekli');
      return;
    }
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
        setError('Geerli bir URL girin (http/https)');
        return;
      }
    } catch {
      setError('Geerli bir URL girin');
      return;
    }
    onInsert(url, text || undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            Baglanti Ekle
          </DialogTitle>
          <DialogDescription>Metne baglanti eklemek icin URL girin.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-url">URL *</Label>
            <Input
              ref={urlRef}
              id="link-url"
              type="url"
              placeholder="https://ornek.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              className={cn(error && 'border-red-500')}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="link-text">Gorunen Metin (opsiyonel)</Label>
            <Input
              id="link-text"
              placeholder="Baglanti metni..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Iptal
            </Button>
            <Button type="submit">Ekle</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────────────────────────────────────────
   MediaPicker (Video/Image)
   ────────────────────────────────────────────────────────── */

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertVideo: (url: string, type: VideoEmbedAttrs['type'], title?: string) => void;
  onInsertImage: (url: string, alt?: string) => void;
}

function MediaPicker({ open, onOpenChange, onInsertVideo, onInsertImage }: MediaPickerProps) {
  const [activeTab, setActiveTab] = useState('video');
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setUrl('');
      setTitle('');
      setError('');
      setTimeout(() => urlRef.current?.focus(), 100);
    }
  }, [open]);

  const detectedType = useMemo(
    () => (activeTab === 'video' ? detectVideoType(url) : null),
    [url, activeTab]
  );

  const previewUrl = useMemo(() => {
    if (!url.trim()) return null;
    if (activeTab === 'image') return sanitizeUrl(url);
    if (!detectedType) return null;
    return buildEmbedUrl(url, detectedType);
  }, [url, activeTab, detectedType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    if (activeTab === 'video') {
      const type = detectVideoType(url);
      const safeUrl = sanitizeUrl(url);
      if (!safeUrl && type !== 'mp4') {
        setError('Gecerli bir video URL girin');
        return;
      }
      onInsertVideo(url, type, title || undefined);
    } else {
      const safeUrl = sanitizeUrl(url);
      if (!safeUrl) {
        setError('Gecerli bir gorsel URL girin');
        return;
      }
      onInsertImage(url, title || undefined);
    }

    setUrl('');
    setTitle('');
    onOpenChange(false);
  };

  const placeholders: Record<string, string> = {
    video: 'YouTube, Vimeo, Dailymotion veya MP4 linki...',
    image: 'https://ornek.com/gorsel.jpg',
  };

  const platformHints: Record<string, { label: string; color: string }> = {
    youtube: { label: 'YouTube', color: 'bg-red-500' },
    vimeo: { label: 'Vimeo', color: 'bg-sky-500' },
    dailymotion: { label: 'Dailymotion', color: 'bg-blue-600' },
    mp4: { label: 'MP4 Video', color: 'bg-purple-500' },
    iframe: { label: 'Iframe', color: 'bg-slate-500' },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Medya Ekle
          </DialogTitle>
          <DialogDescription>Video veya gorsel URL'si ekleyin.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="video" className="flex-1 gap-2">
              <Video className="h-4 w-4" />
              Video
            </TabsTrigger>
            <TabsTrigger value="image" className="flex-1 gap-2">
              <ImageIcon className="h-4 w-4" />
              Gorsel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="video" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="media-url">Video URL *</Label>
              <div className="relative">
                <Input
                  ref={urlRef}
                  id="media-url"
                  placeholder={placeholders.video}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError('');
                  }}
                  className={cn('pr-20', error && 'border-red-500')}
                />
                {detectedType && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wide',
                        platformHints[detectedType]?.color || 'bg-slate-500'
                      )}
                    >
                      {platformHints[detectedType]?.label || detectedType}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-title">Baslik (opsiyonel)</Label>
              <Input
                id="video-title"
                placeholder="Video basligi..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">Gorsel URL *</Label>
              <Input
                ref={activeTab === 'image' ? urlRef : undefined}
                id="image-url"
                placeholder={placeholders.image}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError('');
                }}
                className={cn(error && 'border-red-500')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image-alt">Alt Metin (opsiyonel)</Label>
              <Input
                id="image-alt"
                placeholder="Gorsel aciklamasi..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview */}
        {previewUrl && (
          <div className="rounded-xl overflow-hidden border bg-muted/50">
            {activeTab === 'video' && detectedType === 'mp4' ? (
              // biome-ignore lint/a11y/useMediaCaption: Admin media preview
              <video
                controls
                playsInline
                preload="metadata"
                className="w-full aspect-video object-contain bg-black"
              >
                <source src={previewUrl} type="video/mp4" />
              </video>
            ) : activeTab === 'video' ? (
              <iframe
                src={previewUrl}
                className="w-full aspect-video border-0"
                allowFullScreen
                title="Video onizleme"
              />
            ) : (
              // biome-ignore lint/performance/noImgElement: Admin media preview
              <img src={previewUrl} alt="Onizleme" className="w-full aspect-video object-cover" />
            )}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 px-3 py-2 text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Iptal
          </Button>
          <Button onClick={handleSubmit} disabled={!url.trim()}>
            {activeTab === 'video' ? 'Video Ekle' : 'Gorsel Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────────────────────────────────────────────
   Toolbar
   ────────────────────────────────────────────────────────── */

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive';
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  title,
  children,
  variant = 'default',
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        'h-8 w-8 rounded-lg transition-all duration-150',
        isActive
          ? 'bg-primary/10 text-primary shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
        variant === 'destructive' &&
          'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30',
        disabled && 'opacity-30 pointer-events-none'
      )}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-0.5 shrink-0" />;
}

/* ──────────────────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────────────────── */

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Yazmaya baslayin...',
  className,
}: RichTextEditorProps) {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const prevValueRef = useRef<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full my-4' },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            'text-blue-600 underline decoration-blue-600/30 hover:decoration-blue-600 transition-colors',
        },
      }),
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      VideoEmbed,
    ],
    content: value,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose prose-slate dark:prose-invert max-w-none min-h-[400px] p-6 focus:outline-none',
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
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    view.state.schema.nodes.image.create({ src: result })
                  )
                );
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
                    view.dispatch(
                      view.state.tr.replaceSelectionWith(
                        view.state.schema.nodes.image.create({ src: result })
                      )
                    );
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

  const handleLinkInsert = useCallback(
    (url: string, text?: string) => {
      if (!editor) return;
      if (text) {
        editor
          .chain()
          .focus()
          .insertContent(`<a href="${escapeHtml(url)}">${escapeHtml(text)}</a>`)
          .run();
      } else {
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
    },
    [editor]
  );

  const openLinkDialog = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href || '';
    const previousText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      ''
    );
    setLinkDialogOpen(true);
    // Store initial values for the dialog
    linkDialogRef.current = { url: previousUrl, text: previousText };
  }, [editor]);

  const linkDialogRef = useRef({ url: '', text: '' });

  const wordCount = useMemo(() => {
    if (!editor) return { words: 0, chars: 0 };
    const text = editor.state.doc.textContent;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    return { words, chars };
  }, [editor?.state.doc]);

  if (!editor) {
    return (
      <div className={cn('border rounded-xl min-h-[400px] animate-pulse bg-muted/50', className)} />
    );
  }

  return (
    <div className={cn('border rounded-xl overflow-hidden bg-card', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1.5">
        {/* Undo/Redo */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Geri Al (Ctrl+Z)">
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Ileri Al (Ctrl+Shift+Z)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Text Style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Kalin (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italik (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Altizili (Ctrl+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Satir Ici Kod"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Vurgulama"
        >
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Baslik 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Baslik 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Baslik 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
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
          title="Numarali Liste"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Alinti Bloku"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Kod Blogu"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Alignment */}
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
          title="Saga Hizala"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Iki Yana Yasla"
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Insert */}
        <ToolbarButton onClick={openLinkDialog} title="Baglanti Ekle (Ctrl+K)">
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => setMediaPickerOpen(true)} title="Medya Ekle (Gorsel/Video)">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Yatay Cizgi"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Clear Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Biimlendirmeyi Temizle"
        >
          <RemoveFormatting className="h-4 w-4" />
        </ToolbarButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="bg-white dark:bg-slate-900" />

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{wordCount.words} sozcuk</span>
          <span>{wordCount.chars} karakter</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            Ctrl+K
          </kbd>
          <span>baglanti</span>
        </div>
      </div>

      {/* Dialogs */}
      <LinkDialog
        open={linkDialogOpen}
        onOpenChange={setLinkDialogOpen}
        onInsert={handleLinkInsert}
        initialUrl={linkDialogRef.current.url}
        initialText={linkDialogRef.current.text}
      />

      <MediaPicker
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        onInsertVideo={(url, type, title) => {
          editor
            .chain()
            .focus()
            .insertContent({
              type: 'videoEmbed',
              attrs: { src: extractVideoId(url, type), type, title },
            })
            .run();
        }}
        onInsertImage={(url, alt) => {
          editor
            .chain()
            .focus()
            .setImage({ src: url, alt: alt || '' })
            .run();
        }}
      />
    </div>
  );
}
