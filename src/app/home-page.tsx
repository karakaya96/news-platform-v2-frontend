'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FeaturedArticle } from '@/components/news/featured-article';
import { NewsGrid } from '@/components/news/news-grid';
import { TrendingWidget } from '@/components/news/trending-widget';
import { BreakingTicker } from '@/components/news/breaking-ticker';
import type { News, Category } from '@/types';
import { ARTICLE_LIMITS, translateCategoryName } from '@/lib/constants';
import { formatDate } from '@/lib/utils';

interface HomePageClientProps {
  featured: News[];
  breaking: News[];
  latest: News[];
  categories: Category[];
  categoryArticles: News[][];
}

export default function HomePageClient({ featured, breaking, latest, categories, categoryArticles }: HomePageClientProps) {
  const [heroIndex, setHeroIndex] = useState(0);

  // Auto-rotate featured hero every 5 seconds
  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  const heroArticle = featured[heroIndex];
  const otherFeatured = featured.filter((_, i) => i !== heroIndex);
  const categorySections = categories.slice(0, 3);

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Breaking News Banner */}
      {breaking.length > 0 && (
        <BreakingTicker articles={breaking} />
      )}

      {/* Featured Articles Carousel */}
      {featured.length > 0 && (
        <section className='mb-12'>
          {/* Hero - Sıradaki haber */}
          <FeaturedArticle article={heroArticle} />

          {/* Diğer featured haberler - Yatay scroll */}
          {otherFeatured.length > 0 && (
            <div className='mt-8'>
              <div className='flex items-center justify-between mb-5'>
                <h2 className='text-xl font-bold text-slate-900 dark:text-slate-100'>
                  📌 Öne Çıkan Haberler
                </h2>
                <div className='flex items-center gap-3'>
                  <span className='text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full'>
                    {heroIndex + 1} / {featured.length}
                  </span>
                  <div className='flex gap-1.5'>
                    {featured.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setHeroIndex(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          i === heroIndex
                            ? 'w-8 bg-blue-600 shadow-md shadow-blue-500/30'
                            : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                        }`}
                        aria-label={`Haber ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className='flex gap-5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent'>
                {otherFeatured.map((article) => (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className='group flex-shrink-0 w-[320px] sm:w-[360px]'
                  >
                    <div className='relative aspect-[16/10] overflow-hidden rounded-xl bg-muted shadow-lg ring-1 ring-black/5 dark:ring-white/10'>
                      {article.image_url ? (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800'>
                          <span className='text-slate-500 text-sm'>Görsel yok</span>
                        </div>
                      )}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
                      <div className='absolute bottom-0 left-0 right-0 p-4'>
                        {article.category_name && (
                          <span className='inline-block px-2.5 py-0.5 mb-2 text-[10px] font-bold tracking-wider uppercase bg-blue-600/90 text-white rounded-md backdrop-blur-sm'>
                            {translateCategoryName(article.category_slug || '', article.category_name)}
                          </span>
                        )}
                        <h3 className='text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-blue-300 transition-colors'>
                          {article.title}
                        </h3>
                        <div className='flex items-center text-gray-400 text-xs mt-2'>
                          {article.author_name && (
                            <span className='mr-2'>✍️ {article.author_name}</span>
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
