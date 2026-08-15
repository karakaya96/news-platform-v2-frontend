'use client';

export const dynamic = 'force-dynamic';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const presetColors = [
  '#3b82f6',
  '#ef4444',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#f97316',
  '#6366f1',
  '#14b8a6',
  '#84cc16',
  '#64748b',
];

function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u',
    Ç: 'c', Ğ: 'g', İ: 'i', Ö: 'o', Ş: 's', Ü: 'u',
  };
  return text
    .toLowerCase()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (c) => turkishMap[c] || c)
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function NewCategoryPage() {
  const t = useTranslations('admin.newCategoryPage');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categorySchema = z.object({
    name: z.string().min(1, t('nameRequired')).max(100),
    slug: z.string().min(1, t('slugRequired')).max(100),
    description: z.string().max(500).optional(),
    color: z.string().optional(),
    sortOrder: z.number().int().default(0),
  });

  type CategoryFormData = z.infer<typeof categorySchema>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      color: '#3b82f6',
      sortOrder: 0,
    },
  });

  const name = watch('name');
  const color = watch('color');

  const generateSlug = useCallback(() => {
    if (name) {
      setValue('slug', slugify(name));
    }
  }, [name, setValue]);

  useEffect(() => {
    const timer = setTimeout(generateSlug, 500);
    return () => clearTimeout(timer);
  }, [generateSlug]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.post('/api/categories', {
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        color: data.color || '#3b82f6',
        sortOrder: data.sortOrder ?? 0,
      });

      if (res.success) {
        toast.success(t('created'));
        router.push('/admin/categories');
      } else {
        toast.error(res.error || t('createFailed'));
      }
    } catch {
      toast.error(t('createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="max-w-2xl">
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('detailsCard')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('nameLabel')}</Label>
              <Input
                id="name"
                placeholder={t('namePlaceholder')}
                {...register('name')}
                className={cn(errors.name && 'border-red-500')}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="category-slug"
                {...register('slug')}
                className={cn(errors.slug && 'border-red-500')}
              />
              {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('descriptionLabel')}</Label>
              <Textarea
                id="description"
                placeholder={t('descriptionPlaceholder')}
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sortOrder">{t('orderLabel')}</Label>
              <Input
                id="sortOrder"
                type="number"
                placeholder="0"
                {...register('sortOrder', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('colorLabel')}</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color || '#3b82f6'}
                  onChange={(e) => setValue('color', e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer border-0"
                />
                <Input {...register('color')} placeholder="#3b82f6" className="w-32" />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cn(
                      'h-7 w-7 rounded-full transition-transform hover:scale-110',
                      color === c && 'ring-2 ring-offset-2 ring-blue-500'
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setValue('color', c)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('createButton')}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/admin/categories')}>
            {t('cancelButton')}
          </Button>
        </div>
      </form>
    </div>
  );
}
