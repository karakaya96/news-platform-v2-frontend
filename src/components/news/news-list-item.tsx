import React from 'react';
import Link from 'next/link';
import type { News } from '@/types';
import { formatRelativeDate } from '@/lib/utils';
import { translateCategoryName } from '@/lib/constants';

interface NewsListItemProps {
  article: News;
  showImage?: boolean;
}

export function NewsListItem({ article, showImage = true }: NewsListItemProps) {
  return (
    <Link href={`/news/${article.slug}`} className='group flex gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors'>
      {showImage && (
        <div className='relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted'>
          {article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-slate-100'>
              <span className='text-slate-400 text-xs'>—</span>
            </div>
          )}
        </div>
      )}
      <div className='flex-1 min-w-0'>
        <h4 className='text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors leading-snug'>
          {article.title}
        </h4>
        <p className='text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed'>
          {article.excerpt}
        </p>
        <div className='flex items-center text-xs text-muted-foreground mt-2'>
          {article.category_name && (
            <span className='mr-2 font-medium'>{translateCategoryName(article.category_slug || '', article.category_name)}</span>
          )}
          <time dateTime={article.published_at || undefined}>
            {formatRelativeDate(article.published_at)}
          </time>
        </div>
      </div>
    </Link>
  );
}
