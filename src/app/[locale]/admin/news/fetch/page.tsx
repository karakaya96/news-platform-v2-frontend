'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { NewsFetchPreview } from '@/components/admin/news-fetch-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import type { ScrapedNews } from '@/types';
import { Link } from '@/i18n/navigation';
import { ArrowLeft, Loader2, Search, Globe } from 'lucide-react';

export default function FetchNewsPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [scrapedData, setScrapedData] = useState<ScrapedNews | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!url.trim()) {
      toast.error('Lütfen bir URL girin');
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      toast.error('Geçersiz URL formatı');
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const res = await api.post<ScrapedNews>('/api/news/preview', { url: url.trim() });

      if (res.success && res.data) {
        setScrapedData(res.data);
        toast.success('Haber başarıyla çekildi');
      } else {
        const errorMsg = res.error || 'Haber çekilemedi';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch {
      const errorMsg = 'Haber çekilirken bir hata oluştu';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsFetching(false);
    }
  };

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
    seoKeywords?: string;
  }) => {
    if (!data.content) {
      toast.error('İçerik zorunludur');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post('/api/news/from-preview', {
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
        seo_keywords: data.seoKeywords || '',
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

  const handleCancel = () => {
    setScrapedData(null);
    setUrl('');
    setError(null);
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/news"
          className="flex items-center justify-center h-10 w-10 rounded-lg border bg-white hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h2 className="text-2xl font-bold">Haber Çek</h2>
      </div>

      {!scrapedData ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5" />
              URL ile Haber Çekme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Haber URL'si</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  placeholder="https://example.com/haber/12345"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isFetching) {
                      handleFetch();
                    }
                  }}
                  disabled={isFetching}
                  className="flex-1"
                />
                <Button
                  onClick={handleFetch}
                  disabled={isFetching || !url.trim()}
                  className="min-w-[120px]"
                >
                  {isFetching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Çekiliyor...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Haber Çek
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950/50 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
              <h4 className="font-medium text-sm mb-2">Nasıl Çalışır?</h4>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• Haber sitesinin URL'sini girin</li>
                <li>• Sistem otomatik olarak içeriği çekecektir</li>
                <li>• Çekilen haberi düzenleyebilir ve yayınlayabilirsiniz</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      ) : (
        <NewsFetchPreview
          scrapedData={scrapedData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
