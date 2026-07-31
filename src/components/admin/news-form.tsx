'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Eye, Loader2, Star, Zap } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { translateCategoryName } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Category, News } from '@/types';

const newsSchema = z.object({
  title: z.string().min(1, 'Başlık zorunludur').max(200),
  slug: z.string().min(1, 'Slug zorunludur').max(200),
  categoryId: z.string().min(1, 'Kategori zorunludur'),
  excerpt: z.string().max(500).optional(),
  imageUrl: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  status: z.enum(['draft', 'published', 'archived']),
  isFeatured: z.boolean(),
  isBreaking: z.boolean(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
});

type NewsFormData = z.infer<typeof newsSchema>;

interface NewsFormProps {
  article?: News;
  onSubmit: (data: NewsFormData & { content: string }) => Promise<void>;
  isSubmitting: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function NewsForm({ article, onSubmit, isSubmitting }: NewsFormProps) {
  const [content, setContent] = useState(article?.content || '');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showSeo, setShowSeo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: article?.title || '',
      slug: article?.slug || '',
      categoryId: String(article?.categoryId || ''),
      excerpt: article?.excerpt || '',
      imageUrl: article?.imageUrl || '',
      status:
        article?.status === 'published' || article?.status === 'archived'
          ? article.status
          : 'draft',
      isFeatured: Boolean(article?.isFeatured),
      isBreaking: Boolean(article?.isBreaking),
      seoTitle: article?.seoTitle || '',
      seoDescription: article?.seoDescription || '',
    },
  });

  const title = watch('title');
  const imageUrl = watch('imageUrl');
  const status = watch('status');
  const isFeatured = watch('isFeatured');
  const isBreaking = watch('isBreaking');

  // Auto-generate slug from title
  const generateSlug = useCallback(() => {
    if (!article && title) {
      setValue('slug', slugify(title));
    }
  }, [title, article, setValue]);

  useEffect(() => {
    const timer = setTimeout(generateSlug, 500);
    return () => clearTimeout(timer);
  }, [generateSlug]);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get<Category[]>('/api/categories');
        if (res.success && res.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const onFormSubmit = handleSubmit(async (data) => {
    await onSubmit({ ...data, content });
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  placeholder="Haber başlığı..."
                  {...register('title')}
                  className={cn(errors.title && 'border-red-500')}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  placeholder="haber-slug"
                  {...register('slug')}
                  className={cn(errors.slug && 'border-red-500')}
                />
                {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Özet</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Haberin kısa özeti..."
                  rows={3}
                  {...register('excerpt')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">İçerik *</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Haber içeriğini buraya yazın..."
              />
              {!content && <p className="text-sm text-red-500 mt-1">İçerik zorunludur</p>}
            </CardContent>
          </Card>

          {/* SEO Section */}
          <Card>
            <CardHeader className="cursor-pointer" onClick={() => setShowSeo(!showSeo)}>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">SEO Ayarları</CardTitle>
                {showSeo ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            {showSeo && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Başlığı</Label>
                  <Input
                    id="seoTitle"
                    placeholder="Özel SEO başlığı..."
                    {...register('seoTitle')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Açıklaması</Label>
                  <Textarea
                    id="seoDescription"
                    placeholder="Arama motorları için meta açıklaması..."
                    rows={3}
                    {...register('seoDescription')}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Yayınla</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select
                  value={status}
                  onValueChange={(val) => setValue('status', val as 'draft' | 'published')}
                >
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                    <SelectItem
                      value="draft"
                      className="dark:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-white"
                    >
                      Taslak
                    </SelectItem>
                    <SelectItem
                      value="published"
                      className="dark:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-white"
                    >
                      Yayında
                    </SelectItem>
                    <SelectItem
                      value="archived"
                      className="dark:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-white"
                    >
                      Arşiv
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer',
                  isFeatured
                    ? 'border-amber-300 bg-amber-50 dark:border-amber-500 dark:bg-amber-950/50'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'
                )}
                onClick={() => setValue('isFeatured', !isFeatured)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                      isFeatured
                        ? 'bg-amber-200 text-amber-700 dark:bg-amber-700 dark:text-amber-100'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-400'
                    )}
                  >
                    <Star className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="cursor-pointer font-medium text-sm dark:text-slate-100">
                      Öne Çıkan
                    </Label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ana sayfada öne çıkar
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    isFeatured ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                      isFeatured ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </div>
              </div>

              <div
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer',
                  isBreaking
                    ? 'border-red-300 bg-red-50 dark:border-red-500 dark:bg-red-950/50'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500'
                )}
                onClick={() => setValue('isBreaking', !isBreaking)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                      isBreaking
                        ? 'bg-red-200 text-red-700 dark:bg-red-700 dark:text-red-100'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-400'
                    )}
                  >
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="cursor-pointer font-medium text-sm dark:text-slate-100">
                      Son Dakika Haberi
                    </Label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Son dakika banner&apos;ı
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    isBreaking ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                      isBreaking ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={isSubmitting || !content} className="flex-1">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {article ? 'Güncelle' : 'Oluştur'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kategori *</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCategories ? (
                <div className="h-10 bg-muted animate-pulse rounded" />
              ) : (
                <Select
                  value={watch('categoryId')}
                  onValueChange={(val) => setValue('categoryId', val)}
                >
                  <SelectTrigger
                    className={cn(
                      errors.categoryId && 'border-red-500',
                      'dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100'
                    )}
                  >
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                    {categories.map((cat) => (
                      <SelectItem
                        key={cat.id}
                        value={String(cat.id)}
                        className="dark:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-white"
                      >
                        {translateCategoryName(cat.slug, cat.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.categoryId && (
                <p className="text-sm text-red-500 mt-1">{errors.categoryId.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Öne Çıkan Görsel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Görsel URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://ornek.com/gorsel.jpg"
                  {...register('imageUrl')}
                />
                {errors.imageUrl && (
                  <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
                )}
              </div>
              {imageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="w-full h-full object-cover"
                    sizes="100%"
                    unoptimized
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold">Önizleme</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                Kapat
              </Button>
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4 dark:text-slate-100">{title}</h1>
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt=""
                  fill
                  className="w-full max-h-[400px] object-cover rounded-lg mb-4"
                  sizes="100%"
                  unoptimized
                />
              )}
              <div
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
