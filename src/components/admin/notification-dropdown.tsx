'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Bell, Clock, FileText, Star, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { News } from '@/types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: News[];
  visibleNotifications: News[];
  hasMore: boolean;
  showAll: boolean;
  onShowAll: () => void;
  buttonPosition: { top: number; right: number } | null;
}

const VIEWED_KEY = 'admin_viewed_articles';

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

export function NotificationDropdown({
  isOpen,
  onClose,
  notifications,
  visibleNotifications,
  hasMore,
  showAll,
  onShowAll,
  buttonPosition,
}: NotificationDropdownProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/50 sm:hidden"
        onClick={onClose}
      />
      {/* Dropdown panel - rendered at body level via layout */}
      <div
        ref={dropdownRef}
        className="fixed inset-x-0 bottom-0 z-[9999] sm:shadow-xl sm:border sm:border-slate-200 sm:dark:border-slate-700 bg-white dark:bg-slate-900 shadow-slate-200/50 dark:shadow-black/30 overflow-hidden flex flex-col rounded-t-3xl sm:rounded-xl sm:max-w-[calc(100vw-2rem)] max-h-[calc(100vh-4rem)] sm:max-h-[80vh] sm:w-96"
        style={typeof window !== 'undefined' && window.innerWidth >= 640 && buttonPosition
          ? { position: 'fixed' as const, top: buttonPosition.top, right: buttonPosition.right, bottom: 'auto', left: 'auto', width: '24rem', maxHeight: '80vh', borderRadius: '0.75rem' }
          : undefined
        }
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex-shrink-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t('recentNews')}
          </h3>
        </div>
        <div className="overflow-y-auto flex-1 min-h-0">
          {visibleNotifications.length > 0 ? (
            visibleNotifications.map((article) => (
              <button
                key={article.id}
                onClick={() => {
                  router.push(`/admin/news/${article.id}/edit`);
                  onClose();
                }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 active:bg-indigo-100 dark:active:bg-indigo-950/50 transition-colors text-left"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 shrink-0">
                  <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
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
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between flex-shrink-0">
          {hasMore && (
            <button
              onClick={onShowAll}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              {t('showMore', { fallback: 'Daha Fazla Göster' })} ({notifications.length - 10})
            </button>
          )}
          <button
            onClick={() => {
              router.push('/admin/news');
              onClose();
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors ml-auto"
          >
            {t('newsPage.seeAll', { fallback: 'Tümünü Gör →' })}
          </button>
        </div>
      </div>
    </>
  );
}
