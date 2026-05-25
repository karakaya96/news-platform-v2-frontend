import React from 'react';
import Link from 'next/link';
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
        <div className='relative aspect-[16/10] overflow-hidden rounded-xl bg-muted'>
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
      <div className='relative aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] overflow-hidden rounded-2xl bg-muted shadow-2xl'>
        {article.image_url ? (
          <img
            src={article.image_url}
            alt={article.title}
            className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-105'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800'>
            <span className='text-slate-500 text-sm'>Görsel yok</span>
          </div>
        )}
        {/* Gradient overlay - smoother, more cinematic */}
        <div className='absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90' />
        <div className='absolute inset-0 bg-gradient-to-r from-black/40 to-transparent' />

        {/* Content */}
        <div className='absolute bottom-0 left-0 right-0 p-5 sm:p-8 md:p-10 lg:p-12'>
          {article.category_name && (
            <div className='mb-3 sm:mb-4'>
              <span className='inline-block px-3 py-1 text-xs font-bold tracking-wider uppercase bg-blue-600 text-white rounded-md shadow-lg'>
                {translateCategoryName(article.category_slug || '', article.category_name)}
              </span>
            </div>
          )}
          <h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white mb-3 sm:mb-4 line-clamp-3 leading-[1.1] tracking-tight'>
            {article.title}
          </h1>
          <p className='text-gray-300 text-sm sm:text-base md:text-lg mb-4 sm:mb-5 line-clamp-2 max-w-2xl leading-relaxed hidden sm:block'>
            {article.excerpt}
          </p>
          <div className='flex items-center gap-3 sm:gap-4 text-gray-400 text-xs sm:text-sm'>
            {article.author_name && (
              <span className='font-medium text-gray-300'>
                ✍️ {article.author_name}
              </span>
            )}
            <span className='w-1 h-1 rounded-full bg-gray-500' />
            <time dateTime={article.published_at || undefined}>
              📅 {formatDate(article.published_at)}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
}
