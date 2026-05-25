import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { News } from '@/types';
import { formatDate } from '@/lib/utils';
import { translateCategoryName } from '@/lib/constants';

interface FeaturedArticleProps {
  article: News;
  variant?: 'hero' | 'compact';
}

export function FeaturedArticle({ article, variant = 'hero' }: FeaturedArticleProps) {
  if (variant === 'compact') {
    return (
      <Link href={`/news/${article.slug}`} className='group block'>
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
            <h3 className='text-lg font-bold text-white line-clamp-2 leading-snug'>
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
    );
  }

  return (
    <Link href={`/news/${article.slug}`} className='group block'>
      <div className='relative aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-xl'>
        <Image
          src={article.image_url || '/placeholder.jpg'}
          alt={article.title}
          fill
          className='object-cover transition-transform duration-500 group-hover:scale-105'
          priority
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent' />
        <div className='absolute bottom-0 left-0 right-0 p-6 md:p-8 lg:p-10'>
          {article.category_name && (
            <span className='inline-block px-3 py-1 mb-3 text-xs font-semibold bg-white/20 text-white rounded-full backdrop-blur-sm'>
              {translateCategoryName(article.category_slug || '', article.category_name)}
            </span>
          )}
          <h1 className='text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 line-clamp-3 leading-tight'>
            {article.title}
          </h1>
          <p className='text-gray-200 text-sm md:text-base mb-4 line-clamp-2 max-w-3xl leading-relaxed'>
            {article.excerpt}
          </p>
          <div className='flex items-center text-gray-300 text-sm'>
            {article.author_name && (
              <span className='mr-4'>yazan: {article.author_name}</span>
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
