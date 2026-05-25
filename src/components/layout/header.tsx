'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NAVIGATION, SITE_NAME } from '@/lib/constants';
import { ThemeToggle } from './theme-toggle';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
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
            <form onSubmit={handleSearch} className='flex items-center space-x-2'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='search'
                  placeholder='Haber ara...'
                  className='w-56 pl-9 bg-muted/50 border-transparent focus:border-border focus:bg-background'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type='submit' size='icon' variant='ghost'>
                <Search className='h-4 w-4' />
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
