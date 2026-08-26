'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { translateCategoryName } from '@/lib/constants';
import { useTimezone } from '@/lib/timezone';
import { formatDateWithTime } from '@/lib/utils';
import type { News } from '@/types';

interface FeaturedArticleProps {
  article: News;
  variant?: 'hero' | 'compact';
}

export function FeaturedArticle({ article, variant = 'hero' }: FeaturedArticleProps) {
  const t = useTranslations('news');
  const locale = useLocale();
  const timezone = useTimezone();

  if (variant === 'compact') {
    return (
      <Link href={`/news/${article.slug}`} className="group block">
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
                {translateCategoryName(article.categorySlug || '', article.categoryName, locale)}
              </span>
            )}
            <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug">
              {article.title}
            </h3>
            <div className="flex items-center text-gray-300 text-xs mt-2">
              {article.authorName && (
                <span className="mr-3">
                  {t('writtenBy')}
                  {article.authorName}
                </span>
              )}
              <time dateTime={article.publishedAt || undefined}>
                {formatDateWithTime(article.publishedAt, locale, timezone)}
              </time>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <div className="relative aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xl bg-muted">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjZDNkM2QzIi8+PC9zdmc+"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
            <span className="text-slate-500 text-sm">{t('noImage')}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-10">
          {article.categoryName && (
            <span className="inline-block px-2 sm:px-3 py-1 mb-2 sm:mb-3 text-xs font-semibold bg-white/20 text-white rounded-full backdrop-blur-sm">
              {translateCategoryName(article.categorySlug || '', article.categoryName, locale)}
            </span>
          )}
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 line-clamp-3 leading-tight">
            {article.title}
          </h1>
          <p className="text-gray-200 text-xs sm:text-sm md:text-base mb-3 sm:mb-4 line-clamp-2 max-w-3xl leading-relaxed hidden sm:block">
            {article.excerpt}
          </p>
          <div className="flex items-center text-gray-300 text-xs sm:text-sm">
            {article.authorName && (
              <span className="mr-3 sm:mr-4">
                {t('writtenBy')}
                {article.authorName}
              </span>
            )}
            <time dateTime={article.publishedAt || undefined}>
              {formatDateWithTime(article.publishedAt, locale, timezone)}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
}
