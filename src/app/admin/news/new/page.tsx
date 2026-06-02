'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { NewsForm } from '@/components/admin/news-form';
import { toast } from 'sonner';

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const res = await api.post('/api/news', {
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
