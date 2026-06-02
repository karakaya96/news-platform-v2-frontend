'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#84cc16', // lime
  '#64748b', // slate
];

export default function NewCategoryPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    },
  });

  const name = watch('name');
  const color = watch('color');

  // Auto-generate slug from name
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
      });

      if (res.success) {
        toast.success('Kategori başarıyla oluşturuldu');
        router.push('/admin/categories');
      } else {
        toast.error(res.error || 'Kategori oluşturulamadı');
      }
    } catch {
      toast.error('Kategori oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Yeni Kategori Oluştur</h2>

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
            Kategori Oluştur
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
