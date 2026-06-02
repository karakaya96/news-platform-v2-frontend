'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NAVIGATION, SITE_NAME } from '@/lib/constants';
import { ThemeToggle } from './theme-toggle';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';

interface Suggestion {
  id: number;
  title: string;
  slug: string;
}

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const suggestionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/search/suggest?q=${encodeURIComponent(q)}&limit=5`);
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setSuggestions(data.data);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    suggestionTimeoutRef.current = setTimeout(() => fetchSuggestions(value), 250);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      router.push(`/news/${suggestions[selectedIndex].slug}`);
    } else if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      router.push(`/news/${suggestions[selectedIndex].slug}`);
      setShowSuggestions(false);
      setSearchQuery('');
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-2 group'>
            <span className='text-2xl font-bold text-primary group-hover:opacity-80 transition-opacity'>
              {SITE_NAME}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center space-x-1'>
            {NAVIGATION.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className='px-3 py-2 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-accent'
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side: Search + Theme Toggle */}
          <div className='hidden md:flex items-center space-x-2'>
            <form onSubmit={handleSearch} className='relative'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='search'
                  placeholder='Haber ara...'
                  className='w-56 pl-9 bg-muted/50 border-transparent focus:border-border focus:bg-background'
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
              </div>
              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className='absolute top-full right-0 mt-1 w-80 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden'
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={s.id}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                        i === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        router.push(`/news/${s.slug}`);
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                      onMouseEnter={() => setSelectedIndex(i)}
                    >
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm truncate">{s.title}</span>
                    </button>
                  ))}
                  <div className="border-t px-4 py-2 bg-muted/30">
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSearch();
                      }}
                    >
                      <Search className="h-3 w-3" /> Tüm sonuçları gör
                    </button>
                  </div>
                </div>
              )}
            </form>
            <ThemeToggle />
          </div>

          {/* Mobile: Theme Toggle + Menu Button */}
          <div className='flex items-center space-x-1 md:hidden'>
            <ThemeToggle />
            <Button
              variant='ghost'
              size='icon'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='md:hidden border-t py-4 space-y-4'>
            <nav className='flex flex-col space-y-1'>
              {NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='px-3 py-2 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-accent'
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <form onSubmit={handleSearch} className='flex items-center space-x-2'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='search'
                  placeholder='Haber ara...'
                  className='w-full pl-9 bg-muted/50'
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
              </div>
              <Button type='submit' size='icon' variant='ghost'>
                <Search className='h-4 w-4' />
              </Button>
            </form>
            {/* Mobile suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="bg-popover border rounded-lg overflow-hidden">
                {suggestions.map((s, i) => (
                  <button
                    key={s.id}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 text-sm ${
                      i === selectedIndex ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      router.push(`/news/${s.slug}`);
                      setShowSuggestions(false);
                      setSearchQuery('');
                    }}
                  >
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{s.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
