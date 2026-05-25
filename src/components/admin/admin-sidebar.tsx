'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Newspaper,
  FolderOpen,
  X,
  NewspaperIcon,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Gösterge Paneli', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Haberler', href: '/admin/news', icon: Newspaper },
  { name: 'Kategoriler', href: '/admin/categories', icon: FolderOpen },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-18 items-center justify-between px-6 py-4 border-b border-white/10">
          <Link href="/admin/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <NewspaperIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">
                NewsHaberGlobal
              </span>
              <span className="block text-[10px] font-medium text-indigo-400 uppercase tracking-widest">
                Yönetim Paneli
              </span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          <p className="px-3 mb-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Menü
          </p>
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin/dashboard' &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                    isActive
                      ? 'bg-white/20'
                      : 'bg-white/5 group-hover:bg-white/10'
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                </div>
                {item.name}
                {isActive && (
                  <Sparkles className="ml-auto h-3.5 w-3.5 text-white/60" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* View Site Link */}
        <div className="px-4 pb-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all duration-200 group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
              <ExternalLink className="h-4 w-4" />
            </div>
            Siteyi Görüntüle
          </Link>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border border-white/5 p-3">
            <p className="text-xs text-slate-400 dark:text-slate-300">
              NewsHaberGlobal v1.0
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              Powered by Cloudflare
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
