'use client';

import React, { useState, useEffect } from 'react';
import type { News } from '@/types';

interface BreakingTickerProps {
  articles: News[];
}

export function BreakingTicker({ articles }: BreakingTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (articles.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % articles.length);
        setIsFading(false);
      }, 400);
    }, 4000);

    return () => clearInterval(interval);
  }, [articles.length]);

  if (articles.length === 0) return null;

  const current = articles[currentIndex];

  return (
    <div className='mb-8 bg-primary/10 dark:bg-primary/20 border border-primary/20 text-foreground rounded-xl overflow-hidden'>
      {/* Mobile: vertical layout, Desktop: horizontal */}
      <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3'>
        {/* Top row mobile / left side desktop */}
        <div className='flex items-center gap-2 sm:gap-3 shrink-0'>
          <span className='bg-primary text-primary-foreground px-2 sm:px-3 py-1 font-bold text-[10px] sm:text-xs uppercase tracking-wider rounded-md shrink-0'>
            Son Dakika
          </span>
          {/* Dots indicator — max 10 visible, scrollable */}
          <div className='flex gap-1.5 shrink-0 overflow-x-auto max-w-[200px] scrollbar-none'>
            {articles.slice(0, Math.min(articles.length, 20)).map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIndex(i); setIsFading(false); }}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 flex-shrink-0 ${
                  i === currentIndex ? 'bg-primary w-4' : 'bg-muted-foreground/30'
                }`}
                aria-label={`Haber ${i + 1}`}
              />
            ))}
            {articles.length > 20 && (
              <span className='text-[10px] text-slate-400 ml-1 shrink-0'>+{articles.length - 20}</span>
            )}
          </div>
        </div>
        {/* Counter */}
        <span className='text-xs text-slate-500 dark:text-slate-400 shrink-0 hidden sm:block'>
          {currentIndex + 1} / {articles.length}
        </span>
        {/* Title — 2 lines on mobile, 1 line on desktop */}
        <div className='flex-1 min-w-0 relative overflow-hidden sm:h-6'>
          <a
            href={`/news/${current.slug}`}
            className={`block sm:absolute sm:inset-0 sm:flex sm:items-center font-medium text-sm leading-snug hover:text-primary transition-all duration-400 line-clamp-2 sm:line-clamp-1 ${
              isFading ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            {current.title}
          </a>
        </div>
      </div>
    </div>
  );
}
