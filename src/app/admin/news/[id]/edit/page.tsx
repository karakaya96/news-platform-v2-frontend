'use client';

export const dynamic = 'force-dynamic';

export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { NewsForm } from '@/components/admin/news-form';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { News } from '@/types';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      try {
        const res = await api.get<News>(`/api/news/id/${id}`);
        if (res.success && res.data) {
          setArticle(res.data);
        } else {
          toast.error('Haber bulunamadı');
          router.push('/admin/news');
        }
      } catch {
        toast.error('Haber yüklenemedi');
        router.push('/admin/news');
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [id, router]);

  const handleSubmit = async (data: {
    title: string;
    slug: string;
    category_id: string;
    excerpt?: string;
    content: string;
    image_url?: string;
    status: 'draft' | 'published' | 'archived';
    is_featured: boolean;
    is_breaking: boolean;
    seo_title?: string;
    seo_description?: string;
  }) => {
    if (!data.content) {
      toast.error('İçerik zorunludur');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.put(`/api/news/${id}`, {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || '',
        category_id: parseInt(data.category_id, 10),
        image_url: data.image_url || '',
        status: data.status,
        is_featured: data.is_featured,
        is_breaking: data.is_breaking,
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
      });

      if (res.success) {
        toast.success('Haber başarıyla güncellendi');
        router.push('/admin/news');
      } else {
        toast.error(res.error || 'Haber güncellenemedi');
      }
    } catch {
      toast.error('Haber güncellenemedi');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">Haberi Düzenle</h2>
      <NewsForm
        article={article}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
