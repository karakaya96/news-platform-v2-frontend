'use client';

export const dynamic = 'force-dynamic';

export const runtime = 'edge';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { NewsForm } from '@/components/admin/news-form';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import type { News } from '@/types';
import { useTranslations } from 'next-intl';

export default function EditArticlePage() {
  const t = useTranslations('admin.editNewsPage');
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
          toast.error(t('notFound'));
          router.push('/admin/news');
        }
      } catch {
        toast.error(t('loadError'));
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
    categoryId: string;
    excerpt?: string;
    content: string;
    imageUrl?: string;
    status: 'draft' | 'published' | 'archived';
    isFeatured: boolean;
    isBreaking: boolean;
    seoTitle?: string;
    seoDescription?: string;
  }) => {
    if (!data.content) {
      toast.error(t('contentRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.put(`/api/news/${id}`, {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || '',
        category_id: Number.parseInt(data.categoryId, 10),
        image_url: data.imageUrl || '',
        status: data.status,
        is_featured: data.isFeatured,
        is_breaking: data.isBreaking,
        seo_title: data.seoTitle || '',
        seo_description: data.seoDescription || '',
      });

      if (res.success) {
        toast.success(t('updated'));
        router.push('/admin/news');
      } else {
        toast.error(res.error || t('updateFailed'));
      }
    } catch {
      toast.error(t('updateFailed'));
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
      <h2 className="text-2xl font-bold mb-6">{t('title')}</h2>
      <NewsForm article={article} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
