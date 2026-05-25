import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
        <div className='relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg'>
          <Image
            src={article.image_url || '/placeholder.jpg'}
            alt={article.title}
            fill
            className='object-cover'
          />
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
