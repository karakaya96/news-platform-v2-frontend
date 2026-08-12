'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { NewsForm } from '@/components/admin/news-form';
import { api } from '@/lib/api';

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      toast.error('İçerik zorunludur');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/api/news', {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || '',
        categoryId: Number.parseInt(data.categoryId, 10),
        imageUrl: data.imageUrl || '',
        status: data.status,
        isFeatured: data.isFeatured,
        isBreaking: data.isBreaking,
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
      });

      if (res.success) {
        toast.success('Haber başarıyla oluşturuldu');
        router.push('/admin/news');
      } else {
        toast.error(res.error || 'Haber oluşturulamadı');
      }
    } catch {
      toast.error('Haber oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <h2 className="text-2xl font-bold mb-6">Yeni Haber Oluştur</h2>
      <NewsForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
