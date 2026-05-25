import React from 'react';
import type { News } from '@/types';
import { NewsListItem } from './news-list-item';
import { TrendingUp } from 'lucide-react';

interface TrendingWidgetProps {
  articles: News[];
}

export function TrendingWidget({ articles }: TrendingWidgetProps) {
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <div className='rounded-xl border bg-card p-5 sticky top-20'>
      <div className='flex items-center gap-2 mb-5'>
        <div className='h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center'>
          <TrendingUp className='h-4 w-4 text-primary' />
        </div>
        <h3 className='text-lg font-bold'>Gündem</h3>
      </div>
      <div className='space-y-1'>
        {articles.map((article, index) => (
          <div key={article.id} className='flex items-start gap-3'>
            <span className='text-2xl font-black text-muted-foreground/20 mt-0.5 min-w-[2rem] text-right'>
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className='flex-1 min-w-0'>
              <NewsListItem article={article} showImage={false} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
