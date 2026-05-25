import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { News } from '@/types';
import { formatDate } from '@/lib/utils';
import { CategoryBadge } from './category-badge';

interface NewsCardProps {
  article: News;
}

export function NewsCard({ article }: NewsCardProps) {
  return (
    <Link href={`/news/${article.slug}`} className='group block'>
      <div className='rounded-xl border bg-card overflow-hidden card-hover'>
        {/* Image */}
        <div className='relative aspect-[16/10] overflow-hidden'>
          <Image
            src={article.image_url || '/placeholder.jpg'}
            alt={article.title}
            fill
            className='object-cover transition-transform duration-500 group-hover:scale-110'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        </div>
        
        {/* Content */}
        <div className='p-5'>
          {article.category_name && article.category_slug && (
            <CategoryBadge category={{ name: article.category_name, slug: article.category_slug, color: article.category_color } as any} className='mb-3' />
          )}
          <h3 className='text-base font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug'>
            {article.title}
          </h3>
          <p className='text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed'>
            {article.excerpt}
          </p>
          <div className='flex items-center text-xs text-muted-foreground'>
            {article.author_name && (
              <span className='mr-3 font-medium'>{article.author_name}</span>
            )}
            <time dateTime={article.published_at || undefined}>
              {formatDate(article.published_at)}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
}
