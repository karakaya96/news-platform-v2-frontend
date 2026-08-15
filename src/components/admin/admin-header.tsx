'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Bell, Clock, FileText, LogOut, Menu, Settings, Star, User, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api, setAuthToken } from '@/lib/api';
import { getUser, removeToken } from '@/lib/auth';
import type { News } from '@/types';

interface AdminHeaderProps {
  title: string;
  onMenuToggle: () => void;
}

const VIEWED_KEY = 'admin_viewed_articles';
const MAX_VISIBLE = 10;

function getViewedIds(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(VIEWED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveViewedIds(ids: Set<number>) {
  if (typeof window === 'undefined') return;
  // Keep only last 200 IDs to prevent localStorage bloat
  const arr = Array.from(ids).slice(-200);
  localStorage.setItem(VIEWED_KEY, JSON.stringify(arr));
}

function formatCount(n: number): string {
  if (n > 99) return '99+';
  return String(n);
}

export function AdminHeader({ title, onMenuToggle }: AdminHeaderProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const user = getUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<News[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchRecentArticles() {
      try {
        const res = await api.get<News[]>('/api/news?status=published&limit=50');
        if (res.success && res.data) {
          const articles = Array.isArray(res.data) ? res.data : [];
          setNotifications(articles);

          // Count unread (not viewed before)
          const viewed = getViewedIds();
          const unread = articles.filter(a => !viewed.has(a.id)).length;
          setUnreadCount(unread);
        }
      } catch {
        // silently fail
      }
    }
    fetchRecentArticles();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    removeToken();
    setAuthToken(null);
    router.push('/admin/login');
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowAll(false);
    if (!showNotifications) {
      // Mark all as viewed
      const viewed = getViewedIds();
      notifications.forEach(a => viewed.add(a.id));
      saveViewedIds(viewed);
      setUnreadCount(0);
    }
  };

  const visibleNotifications = showAll ? notifications : notifications.slice(0, MAX_VISIBLE);
  const hasMore = notifications.length > MAX_VISIBLE && !showAll;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 dark:bg-slate-900/80 dark:border-slate-700/80 backdrop-blur-xl px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Settings */}
        <Button
          variant="ghost"
          size="icon"
          className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl"
          onClick={() => router.push('/admin/settings')}
          title={t('settings')}
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl"
            onClick={handleNotificationClick}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 px-1">
                {formatCount(unreadCount)}
              </span>
            )}
          </Button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-96 rounded-xl bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t('recentNews')}
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {visibleNotifications.length > 0 ? (
                  visibleNotifications.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => {
                        router.push(`/admin/news/${article.id}/edit`);
                        setShowNotifications(false);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors text-left"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex-shrink-0">
                        <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                          {article.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {article.isFeatured && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950 px-1.5 py-0.5 rounded-full">
                              <Star className="h-2.5 w-2.5" />
                              {t('newsPage.featured', { fallback: 'Öne Çıkan' })}
                            </span>
                          )}
                          {article.isBreaking && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950 px-1.5 py-0.5 rounded-full">
                              <Zap className="h-2.5 w-2.5" />
                              {t('newsPage.breakingNews', { fallback: 'Son Dakika' })}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                            <Clock className="h-2.5 w-2.5" />
                            {article.publishedAt
                              ? new Date(article.publishedAt).toLocaleDateString(locale === 'en' ? 'en-US' : 'tr-TR', {
                                  timeZone: 'Europe/Istanbul',
                                })
                              : '-'}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <Bell className="h-8 w-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('newsPage.noNews', { fallback: 'Henüz haber yok' })}</p>
                  </div>
                )}
              </div>
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                {hasMore && (
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    {t('showMore', { fallback: 'Daha Fazla Göster' })} ({notifications.length - MAX_VISIBLE})
                  </button>
                )}
                <button
                  onClick={() => {
                    router.push('/admin/news');
                    setShowNotifications(false);
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors ml-auto"
                >
                  {t('newsPage.seeAll', { fallback: 'Tümünü Gör →' })}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
          <button
            onClick={() => router.push('/admin/profile')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm overflow-hidden hover:ring-2 hover:ring-indigo-300 transition-all"
          >
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Admin')}`}
              alt={user?.name || 'Admin'}
              className="h-full w-full object-cover"
            />
          </button>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {user?.name || 'Admin'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('admin', { fallback: 'Yönetici' })}</p>
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950 rounded-xl ml-1"
        >
          <LogOut className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">{t('logout', { fallback: 'Çıkış' })}</span>
        </Button>
      </div>
    </header>
  );
}
