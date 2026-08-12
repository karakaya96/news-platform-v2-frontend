'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { BreakingTicker } from '@/components/news/breaking-ticker';
import { FeaturedArticle } from '@/components/news/featured-article';
import { NewsGrid } from '@/components/news/news-grid';
import { TrendingWidget } from '@/components/news/trending-widget';
import { Link } from '@/i18n/navigation';
import { ARTICLE_LIMITS, translateCategoryName } from '@/lib/constants';
import { formatDateWithTime } from '@/lib/utils';
import type { Category, News } from '@/types';

interface HomePageClientProps {
  featured: News[];
  breaking: News[];
  latest: News[];
  categories: Category[];
  categoryArticles: News[][];
}

export default function HomePageClient({
  featured,
  breaking,
  latest,
  categories,
  categoryArticles,
}: HomePageClientProps) {
  const t = useTranslations('home');
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
  const categorySections = categories;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breaking News Banner */}
      {breaking.length > 0 && <BreakingTicker articles={breaking} />}

      {/* Featured Articles Carousel */}
      {featured.length > 0 && (
        <section className="mb-12">
          {/* Hero - Sıradaki haber */}
          <FeaturedArticle article={heroArticle} />

          {/* Diğer featured haberler - Yatay scroll */}
          {otherFeatured.length > 0 && (
            <div className="mt-6">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {heroIndex + 1} / {featured.length}
                  </span>
                  <div className="flex gap-1">
                    {featured.map((article, i) => (
                      <button
                        key={article.id}
                        onClick={() => setHeroIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === heroIndex
                            ? 'w-6 bg-blue-500'
                            : 'w-1.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                        }`}
                        aria-label={`News ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {t('featuredNews')}
                </h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {otherFeatured.map((article) => (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="group flex-shrink-0 w-[300px] sm:w-[340px]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                      {article.imageUrl ? (
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="100%"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjZDNkM2QzIi8+PC9zdmc+"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                          <span className="text-slate-500 text-sm">{t('noImage')}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {article.categoryName && (
                          <span className="inline-block px-2 py-0.5 mb-2 text-xs font-semibold bg-white/20 text-white rounded-full backdrop-blur-sm">
                            {translateCategoryName(
                              article.categorySlug || '',
                              article.categoryName
                            )}
                          </span>
                        )}
                        <h3 className="text-base font-bold text-white line-clamp-2 leading-snug">
                          {article.title}
                        </h3>
                        <div className="flex items-center text-gray-300 text-xs mt-2">
                          {article.authorName && (
                            <span className="mr-3">{t('writtenBy')}{article.authorName}</span>
                          )}
                          <time dateTime={article.publishedAt || undefined}>
                            {formatDateWithTime(article.publishedAt)}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Latest News */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">{t('latestNews')}</h2>
            <NewsGrid articles={latest.slice(0, ARTICLE_LIMITS.homepage.latest)} />
          </section>

          {/* Category Sections */}
          {categorySections.map((category, index) => (
            <section key={category.id} className="mb-12">
              <h2 className="text-2xl font-bold mb-6">
                <Link
                  href={`/categories/${category.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {translateCategoryName(category.slug, category.name)}
                </Link>
              </h2>
              <NewsGrid articles={categoryArticles[index]?.slice(0, 3) || []} />
            </section>
          ))}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <TrendingWidget articles={latest.slice(0, 5)} />
        </aside>
      </div>
    </div>
  );
}
