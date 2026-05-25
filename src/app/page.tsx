import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { FeaturedArticle } from '@/components/news/featured-article';
import { NewsGrid } from '@/components/news/news-grid';
import { TrendingWidget } from '@/components/news/trending-widget';
import { BreakingTicker } from '@/components/news/breaking-ticker';
import { NewsGridSkeleton, FeaturedSkeleton } from '@/components/shared/loading-skeleton';
import { NewsListItem } from '@/components/news/news-list-item';
import api from '@/lib/api';
import type { News, Category } from '@/types';
import { ARTICLE_LIMITS, translateCategoryName } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'NewsPlatform - Güvenilir Haber Kaynağınız',
  description: 'Son dakika haberleri, analizler ve derinlemesine raporlama için güvenilir kaynağınız.',
};

async function getFeaturedNews(): Promise<News[]> {
  const res = await api.get<News[]>('/api/news/featured');
  return res.data || [];
}

async function getBreakingNews(): Promise<News[]> {
  const res = await api.get<News[]>('/api/news/breaking');
  return res.data || [];
}

async function getLatestNews(): Promise<News[]> {
  const res = await api.get<News[]>('/api/news', {
    revalidate: 30,
  });
  return res.data || [];
}

async function getCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>('/api/categories');
  return res.data || [];
}

async function getCategoryNews(slug: string): Promise<News[]> {
  const res = await api.get<News[]>(`/api/news?category=${slug}&limit=3`);
  return res.data || [];
}

export default async function HomePage() {
  const [featured, breaking, latest, categories] = await Promise.all([
    getFeaturedNews(),
    getBreakingNews(),
    getLatestNews(),
    getCategories(),
  ]);

  const categorySections = categories.slice(0, 3);

  // Fetch articles for each category
  const categoryArticles = await Promise.all(
    categorySections.map((cat) => getCategoryNews(cat.slug))
  );

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breaking News Banner */}
      {breaking.length > 0 && (
        <BreakingTicker articles={breaking} />
      )}

      {/* Featured Articles */}
      {featured.length > 0 && (
        <section className='mb-12'>
          {/* Hero - İlk haber */}
          <FeaturedArticle article={featured[0]} />
          
          {/* Diğer featured haberler - Yatay scroll carousel */}
          {featured.length > 1 && (
            <div className='mt-6'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-lg font-bold text-slate-900 dark:text-slate-100'>
                  Öne Çıkan Haberler
                </h2>
                <span className='text-sm text-slate-500 dark:text-slate-400'>
                  {featured.length} haber
                </span>
              </div>
              <div className='flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent'>
                {featured.slice(1).map((article) => (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className='group flex-shrink-0 w-[300px] sm:w-[340px]'
                  >
                    <div className='relative aspect-[16/10] overflow-hidden rounded-xl'>
                      <Image
                        src={article.image_url || '/placeholder.jpg'}
                        alt={article.title}
                        fill
                        className='object-cover transition-transform duration-500 group-hover:scale-110'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent' />
                      <div className='absolute bottom-0 left-0 right-0 p-4'>
                        {article.category_name && (
                          <span className='inline-block px-2 py-0.5 mb-2 text-xs font-semibold bg-white/20 text-white rounded-full backdrop-blur-sm'>
                            {translateCategoryName(article.category_slug || '', article.category_name)}
                          </span>
                        )}
                        <h3 className='text-base font-bold text-white line-clamp-2 leading-snug'>
                          {article.title}
                        </h3>
                        <div className='flex items-center text-gray-300 text-xs mt-2'>
                          {article.author_name && (
                            <span className='mr-3'>yazan: {article.author_name}</span>
                          )}
                          <time dateTime={article.published_at || undefined}>
                            {formatDate(article.published_at)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Main Content + Sidebar */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Main Content */}
        <div className='lg:col-span-2'>
          {/* Latest News */}
          <section className='mb-12'>
            <h2 className='text-2xl font-bold mb-6'>Son Haberler</h2>
            <NewsGrid articles={latest.slice(0, ARTICLE_LIMITS.homepage.latest)} />
          </section>

          {/* Category Sections */}
          {categorySections.map((category, index) => (
            <section key={category.id} className='mb-12'>
              <h2 className='text-2xl font-bold mb-6'>
                <Link href={`/categories/${category.slug}`} className='hover:text-primary transition-colors'>
                  {translateCategoryName(category.slug, category.name)}
                </Link>
              </h2>
              <NewsGrid articles={categoryArticles[index]?.slice(0, 3) || []} />
            </section>
          ))}
        </div>

        {/* Sidebar */}
        <aside className='space-y-8'>
          <TrendingWidget articles={latest.slice(0, 5)} />
        </aside>
      </div>
    </div>
  );
}
