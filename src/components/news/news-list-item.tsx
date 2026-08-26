'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { translateCategoryName } from '@/lib/constants';
import { formatRelativeDate } from '@/lib/utils';
import type { News } from '@/types';

interface NewsListItemProps {
  article: News;
  showImage?: boolean;
}

export function NewsListItem({ article, showImage = true }: NewsListItemProps) {
  const locale = useLocale();
  return (
    <Link
      href={`/news/${article.slug}`}
      className="group flex gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
    >
      {showImage && (
        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              sizes="80px"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjZDNkM2QzIi8+PC9zdmc+"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <span className="text-slate-400 text-xs">—</span>
            </div>
          )}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {article.title}
        </h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
          {article.excerpt}
        </p>
        <div className="flex items-center text-xs text-muted-foreground mt-2">
          {article.categoryName && (
            <span className="mr-2 font-medium">
              {translateCategoryName(article.categorySlug || '', article.categoryName, locale)}
            </span>
          )}
          <time dateTime={article.publishedAt || undefined}>
            {formatRelativeDate(article.publishedAt, locale)}
          </time>
        </div>
      </div>
    </Link>
  );
}
