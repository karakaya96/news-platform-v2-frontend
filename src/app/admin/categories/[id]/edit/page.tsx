'use client';

export const runtime = 'edge';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/types';

const categorySchema = z.object({
  name: z.string().min(1, 'Ad zorunludur').max(100),
  slug: z.string().min(1, 'Slug zorunludur').max(100),
  description: z.string().max(500).optional(),
  color: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const presetColors = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
  '#6366f1', '#14b8a6', '#84cc16', '#64748b',
];

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      color: '#3b82f6',
    },
  });

  const color = watch('color');

  useEffect(() => {
    async function loadCategory() {
      try {
        const res = await api.get<Category>(`/api/categories/${id}`);
        if (res.success && res.data) {
          const cat = res.data;
          setCategory(cat);
          reset({
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            color: cat.color || '#3b82f6',
          });
        } else {
          toast.error('Kategori bulunamadı');
          router.push('/admin/categories');
        }
      } catch {
        toast.error('Kategori yüklenemedi');
        router.push('/admin/categories');
      } finally {
        setLoading(false);
      }
    }
    loadCategory();
  }, [id, router, reset]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      const res = await api.put(`/api/categories/${id}`, {
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        color: data.color || '#3b82f6',
      });

      if (res.success) {
        toast.success('Kategori başarıyla güncellendi');
        router.push('/admin/categories');
      } else {
        toast.error(res.error || 'Kategori güncellenemedi');
      }
    } catch {
      toast.error('Kategori güncellenemedi');
    } finally {
      setIsSubmitting(false);
    }
  });

  if (loading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!category) return null;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Kategoriyi Düzenle</h2>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kategori Detayları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad *</Label>
              <Input
                id="name"
                placeholder="Kategori adı..."
                {...register('name')}
                className={cn(errors.name && 'border-red-500')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="category-slug"
                {...register('slug')}
                className={cn(errors.slug && 'border-red-500')}
              />
              {errors.slug && (
                <p className="text-sm text-red-500">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                placeholder="Kategorinin kısa açıklaması..."
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="space-y-2">
              <Label>Renk</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={color || '#3b82f6'}
                  onChange={(e) => setValue('color', e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer border-0"
                />
                <Input
                  {...register('color')}
                  placeholder="#3b82f6"
                  className="w-32"
                />
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
            {isSubmitting && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Kategoriyi Güncelle
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/categories')}
          >
            İptal
          </Button>
        </div>
      </form>
    </div>
  );
}
