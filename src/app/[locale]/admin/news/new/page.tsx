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
        category_id: Number.parseInt(data.categoryId, 10),
        image_url: data.imageUrl || '',
        status: data.status,
        is_featured: data.isFeatured,
        is_breaking: data.isBreaking,
        seo_title: data.seoTitle || '',
        seo_description: data.seoDescription || '',
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
      <NewsForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
