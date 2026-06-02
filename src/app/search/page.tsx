'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, Calendar, Tag, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NewsCard } from '@/components/news/news-card';
import { NewsGridSkeleton } from '@/components/shared/loading-skeleton';
import type { News, Category } from '@/types';
import { translateCategoryName } from '@/lib/constants';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';

interface SearchSuggestion {
  id: number;
  title: string;
  slug: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialPage = parseInt(searchParams.get('page') || '1');
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || 'relevance';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [articles, setArticles] = useState<News[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const suggestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'date' | 'views'>(initialSort as any);

  useEffect(() => {
    fetch(`${API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.data || []);
      })
      .catch(() => {});
  }, []);

  const doSearch = async (q: string, p: number, cat: string, from: string, to: string, sort: string) => {
    setLoading(true);
    setSearched(true);
    setShowSuggestions(false);

    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('page', String(p));
      params.set('limit', '12');
      if (cat) params.set('category', cat);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      if (sort) params.set('sort', sort);

      const res = await fetch(`${API_URL}/api/search?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.data || []);
        setTotalResults(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
        setCurrentPage(p);
      }
    } catch (error) {
      console.error('Search error:', error);
      setArticles([]);
      setTotalResults(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery, initialPage, initialCategory, '', '', initialSort);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuggestions = async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    try {
      const res = await fetch(`${API_URL}/api/search/suggest?q=${encodeURIComponent(q)}&limit=5`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setSuggestions(data.data);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      } else { setSuggestions([]); setShowSuggestions(false); }
    } catch { setSuggestions([]); setShowSuggestions(false); }
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    suggestionTimeoutRef.current = setTimeout(() => fetchSuggestions(value), 250);
  };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (q || selectedCategory || dateFrom || dateTo) {
      doSearch(q, 1, selectedCategory, dateFrom, dateTo, sortBy);
    }
  };

  const handleSuggestionClick = (slug: string, title: string) => {
    setSearchQuery(title);
    setShowSuggestions(false);
    window.location.href = `/news/${slug}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedSuggestionIndex(prev => Math.max(prev - 1, -1)); }
    else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) { e.preventDefault(); handleSuggestionClick(suggestions[selectedSuggestionIndex].slug, suggestions[selectedSuggestionIndex].title); }
    else if (e.key === 'Escape') { setShowSuggestions(false); }
  };

  const clearFilters = () => {
    setSelectedCategory(''); setDateFrom(''); setDateTo(''); setSortBy('relevance');
    setSearchQuery(''); setArticles([]); setSearched(false); setTotalResults(0); setTotalPages(1); setCurrentPage(1);
  };

  const activeFilterCount = [selectedCategory, dateFrom, dateTo].filter(Boolean).length + (sortBy !== 'relevance' ? 1 : 0);

  const goToPage = (newPage: number) => {
    doSearch(searchQuery.trim(), newPage, selectedCategory, dateFrom, dateTo, sortBy);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">🔍 Gelişmiş Arama</h1>

      <div className="relative mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Haber ara... (örn: seçim, ekonomi, spor)"
              className="pl-11 h-12 text-base"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch(); } else handleKeyDown(e); }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {searchQuery && (
              <button type="button" onClick={() => { setSearchQuery(''); setSuggestions([]); setShowSuggestions(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button onClick={handleSearch} className="h-12 px-6">Ara</Button>
          <Button type="button" variant={showFilters ? "default" : "outline"} className="h-12 px-4"
            onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />Filtreler
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">{activeFilterCount}</Badge>
            )}
          </Button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
            {suggestions.map((s, i) => (
              <button key={s.id}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${i === selectedSuggestionIndex ? 'bg-accent' : 'hover:bg-accent/50'}`}
                onMouseDown={(e) => { e.preventDefault(); handleSuggestionClick(s.slug, s.title); }}
                onMouseEnter={() => setSelectedSuggestionIndex(i)}>
                <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{s.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {showFilters && (
        <div className="bg-muted/30 border rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Filtreler</h3>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
                <X className="h-3 w-3 mr-1" /> Temizle
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Tag className="h-3 w-3" /> Kategori</label>
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="">Tümü</option>
                {categories.map(cat => (<option key={cat.id} value={cat.slug}>{translateCategoryName(cat.slug, cat.name)}</option>))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Tarihten</label>
              <Input type="date" className="h-9" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Tarihe</label>
              <Input type="date" className="h-9" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><ArrowUpDown className="h-3 w-3" /> Sıralama</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                <option value="relevance">Alaka</option>
                <option value="date">Tarih (Yeni)</option>
                <option value="views">Görüntülenme</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSearch} size="sm"><Search className="h-3 w-3 mr-2" /> Filtrele</Button>
          </div>
        </div>
      )}

      {loading ? (
        <NewsGridSkeleton />
      ) : searched && articles.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl font-medium mb-2">Sonuç bulunamadı</p>
          <p className="text-sm">Farklı anahtar kelimeler veya filtreler deneyin.</p>
        </div>
      ) : articles.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">{totalResults}</span> sonuç bulundu
              {searchQuery && <span> — &quot;{searchQuery}&quot;</span>}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article) => (<NewsCard key={article.id} article={article} />))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Önceki
              </Button>
              <span className="text-sm text-muted-foreground px-4">Sayfa {currentPage} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
                Sonraki <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-xl font-medium mb-2">Haber aramaya başlayın</p>
          <p className="text-sm">Anahtar kelimeler girin veya filtreleri kullanın.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['seçim', 'ekonomi', 'spor', 'teknoloji', 'dünya'].map(term => (
              <Button key={term} variant="outline" size="sm" onClick={() => { setSearchQuery(term); doSearch(term, 1, '', '', '', 'relevance'); }}>
                {term}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 max-w-7xl"><NewsGridSkeleton /></div>}>
      <SearchContent />
    </Suspense>
  );
}
