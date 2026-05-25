'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NewsGrid } from '@/components/news/news-grid';
import { NewsGridSkeleton } from '@/components/shared/loading-skeleton';
import { Pagination } from '@/components/shared/pagination';
import type { News } from '@/types';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [searchQuery, setSearchQuery] = useState(query);
  const [articles, setArticles] = useState<News[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
      performSearch(query, page);
    }
  }, [query, page]);

  const performSearch = async (q: string, p: number) => {
    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev'}/api/news?search=${encodeURIComponent(q)}&page=${p}&limit=12`
      );
      const data = await res.json();
      if (data.success) {
        setArticles(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Search error:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const url = new URL(window.location.href);
      url.searchParams.set('q', searchQuery.trim());
      url.searchParams.delete('page');
      window.history.pushState({}, '', url.toString());
      performSearch(searchQuery.trim(), 1);
    }
  };

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Arama</h1>

      {/* Search Input */}
      <form onSubmit={handleSearch} className='mb-8'>
        <div className='flex gap-2'>
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              type='search'
              placeholder='Haber ara...'
              className='pl-10'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type='submit'>Ara</Button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <NewsGridSkeleton />
      ) : searched && articles.length === 0 ? (
        <div className='text-center py-12 text-muted-foreground'>
          <Search className='h-12 w-12 mx-auto mb-4' />
          <p className='text-lg mb-2'>Sonuç bulunamadı</p>
          <p>Try different keywords or browse categories.</p>
        </div>
      ) : articles.length > 0 ? (
        <>
          <p className='text-muted-foreground mb-6'>
            &quot;{query}&quot; için sonuçlar gösteriliyor
          </p>
          <NewsGrid articles={articles} />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            basePath='/search'
          />
        </>
      ) : (
        <div className='text-center py-12 text-muted-foreground'>
          <Search className='h-12 w-12 mx-auto mb-4' />
          <p className='text-lg'>Haber bulmak için bir arama terimi girin.</p>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8"><NewsGridSkeleton /></div>}>
      <SearchContent />
    </Suspense>
  );
}
