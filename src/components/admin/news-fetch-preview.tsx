'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp, Loader2, Star, Zap } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
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
import { cn } from '@/lib/utils';
import type { Category, ScrapedNews } from '@/types';

interface NewsFetchPreviewProps {
  scrapedData: ScrapedNews;
  // biome-ignore lint/suspicious/noExplicitAny: consistent with news-form.tsx
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createPreviewSchema(t: ReturnType<typeof useTranslations>) {
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
    seoKeywords: z.string().max(500).optional(),
  });
}

export function NewsFetchPreview({
  scrapedData,
  onSubmit,
  onCancel,
  isSubmitting,
}: NewsFetchPreviewProps) {
  const t = useTranslations('admin.newsForm');
  const previewSchema = createPreviewSchema(t);
  const [categories, setCategories] = useState<Category[]>([]);
  const [content, setContent] = useState(scrapedData.content);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showSeo, setShowSeo] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof previewSchema>>({
    resolver: zodResolver(previewSchema),
    defaultValues: {
      title: scrapedData.title,
      slug: scrapedData.slug || slugify(scrapedData.title),
      categoryId: String(scrapedData.category_id || ''),
      excerpt: scrapedData.excerpt || '',
      imageUrl: scrapedData.image_url || '',
      status: 'draft',
      isFeatured: false,
      isBreaking: false,
      seoTitle: scrapedData.seo_title || '',
      seoDescription: scrapedData.seo_description || '',
      seoKeywords: scrapedData.seo_keywords || '',
    },
  });

  const imageUrl = watch('imageUrl');
  const status = watch('status');
  const isFeatured = watch('isFeatured');
  const isBreaking = watch('isBreaking');

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
                <div className="space-y-2">
                  <Label htmlFor="seoKeywords">SEO Anahtar Kelimeler</Label>
                  <Input
                    id="seoKeywords"
                    placeholder="anahtar, kelimeler, virgülle, ayrılmış"
                    {...register('seoKeywords')}
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

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('saving')}
                    </>
                  ) : (
                    t('save')
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('categoryCard')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingCategories ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Select
                  value={watch('categoryId')}
                  onValueChange={(val) => setValue('categoryId', val)}
                >
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100">
                    <SelectValue placeholder={t('categoryPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-600">
                    {categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={String(category.id)}
                        className="dark:text-slate-100 dark:focus:bg-slate-700 dark:focus:text-white"
                      >
                        {translateCategoryName(category.slug, category.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Image Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('imageCard')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="imageUrl">{t('imageUrlLabel')}</Label>
                <Input
                  id="imageUrl"
                  placeholder={t('imageUrlPlaceholder')}
                  {...register('imageUrl')}
                />
              </div>
              {imageUrl && (
                <div className="relative aspect-video rounded-lg overflow-hidden border dark:border-slate-600">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
