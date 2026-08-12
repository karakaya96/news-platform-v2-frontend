'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Eye, Loader2, Star, Zap } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
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
import { sanitizeArticleContent } from '@/lib/sanitize';
import { cn } from '@/lib/utils';
import type { Category, News } from '@/types';

interface NewsFormProps {
  article?: News;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createNewsSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    title: z.string().min(1, t('titleRequired')).max(200),
    slug: z.string().min(1, t('slugRequired')).max(200),
    categoryId: z.string().min(1, t('categoryRequired')),
    excerpt: z.string().max(500).optional(),
    imageUrl: z.string().url(t('invalidUrl')).optional().or(z.literal('')),
    status: z.enum(['draft', 'published', 'archived']),
    isFeatured: z.boolean(),
    isBreaking: z.boolean(),
    seoTitle: z.string().max(70).optional(),
    seoDescription: z.string().max(160).optional(),
  });
}

export function NewsForm({ article, onSubmit, isSubmitting }: NewsFormProps) {
  const t = useTranslations('admin.newsForm');
  const newsSchema = createNewsSchema(t);
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState(article?.content || '');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showSeo, setShowSeo] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof newsSchema>>({
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
                <Label htmlFor="title">{t('titleLabel')}</Label>
                <Input
                  id="title"
                  placeholder={t('titlePlaceholder')}
                  {...register('title')}
                  className={cn(errors.title && 'border-red-500')}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">{t('slugLabel')}</Label>
                <Input
                  id="slug"
                  placeholder={t('slugPlaceholder')}
                  {...register('slug')}
                  className={cn(errors.slug && 'border-red-500')}
                />
                {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">{t('summaryLabel')}</Label>
                <Textarea
                  id="excerpt"
                  placeholder={t('summaryPlaceholder')}
                  rows={3}
                  {...register('excerpt')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('contentCard')}</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder={t('contentPlaceholder')}
              />
              {!content && <p className="text-sm text-red-500 mt-1">{t('contentRequired')}</p>}
            </CardContent>
          </Card>

          {/* SEO Section */}
          <Card>
<CardHeader className="cursor-pointer" onClick={() => setShowSeo(!showSeo)}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t('seoCard')}</CardTitle>
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
                  <Label htmlFor="seoTitle">{t('seoTitle')}</Label>
                  <Input
                    id="seoTitle"
                    placeholder={t('seoTitlePlaceholder')}
                    {...register('seoTitle')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">{t('seoDescription')}</Label>
                  <Textarea
                    id="seoDescription"
                    placeholder={t('seoDescriptionPlaceholder')}
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
            <CardTitle className="text-lg">{t('publishCard')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t('statusLabel')}</Label>
              <Select
                value={status}
                onValueChange={(val) => setValue('status', val as 'draft' | 'published')}
              >
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
                  <SelectValue placeholder={t('statusPlaceholder')} />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                  <SelectItem
                    value="draft"
                    className="dark:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-white"
                  >
                    {t('draft')}
                  </SelectItem>
                  <SelectItem
                    value="published"
                    className="dark:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-white"
                  >
                    {t('published')}
                  </SelectItem>
                  <SelectItem
                    value="archived"
                    className="dark:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-white"
                  >
                    {t('archived')}
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
                      {t('featuredLabel')}
                    </Label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t('featuredDescription')}
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
                      {t('breakingLabel')}
                    </Label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {t('breakingDescription')}
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
                  {article ? t('updateButton') : t('createButton')}
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
            <CardTitle className="text-lg">{t('categoryCard')}</CardTitle>
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
                  <SelectValue placeholder={t('categoryPlaceholder')} />
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
            <CardTitle className="text-lg">{t('imageCard')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">{t('imageUrl')}</Label>
              <Input
                id="imageUrl"
                placeholder={t('imagePlaceholder')}
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
            <h3 className="font-semibold">{t('previewTitle')}</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
              {t('previewClose')}
            </Button>
          </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4 dark:text-slate-100">{title}</h1>
              {imageUrl && (
                <div className="relative w-full aspect-video max-h-[400px] rounded-lg overflow-hidden mb-4">
                  <Image
                    src={imageUrl}
                    alt=""
                    fill
                    className="w-full h-full object-cover"
                    sizes="100%"
                    unoptimized
                  />
                </div>
              )}
              <div
                className="prose max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeArticleContent(content) }}
              />
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
