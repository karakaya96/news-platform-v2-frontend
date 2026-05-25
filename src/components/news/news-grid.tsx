import React from 'react';
import type { News } from '@/types';
import { NewsCard } from './news-card';

interface NewsGridProps {
  articles: News[];
  columns?: 2 | 3 | 4;
}

export function NewsGrid({ articles, columns = 3 }: NewsGridProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className='text-center py-12 text-muted-foreground'>
        Henüz haber bulunamadı.
      </div>
    );
  }

  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className={`grid ${gridClass} gap-6`}>
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}
