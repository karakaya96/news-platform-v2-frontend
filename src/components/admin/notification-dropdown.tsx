'use client';

import { BellOff, Clock, FileText, Newspaper, Star, Zap } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import type { News } from '@/types';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: News[];
  visibleNotifications: News[];
  hasMore: boolean;
  showAll: boolean;
  onShowAll: () => void;
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
  showAll: _showAll,
  onShowAll,
}: NotificationDropdownProps) {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track viewed ids at open time so we can highlight "new" items
  const [viewedAtOpen, setViewedAtOpen] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setViewedAtOpen(getViewedIds());
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Close on outside click / touch
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const relativeTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return locale === 'en' ? 'now' : 'şimdi';
    if (mins < 60) return locale === 'en' ? `${mins}m` : `${mins} dk`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return locale === 'en' ? `${hours}h` : `${hours} sa`;
    const days = Math.floor(hours / 24);
    if (days < 7) return locale === 'en' ? `${days}d` : `${days} g`;
    return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'tr-TR', {
      day: 'numeric',
      month: 'short',
      timeZone: 'Europe/Istanbul',
    });
  };

  return (
    <>
      {/* Backdrop — all screen sizes; lighter on desktop since dropdown is anchored */}
      <div
        className="fixed inset-0 z-[9998] bg-black/40 sm:bg-transparent"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel: bottom sheet on mobile, anchored popover on desktop */}
      <div
        ref={dropdownRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('recentNews')}
        className="
          fixed z-[9999] flex flex-col overflow-hidden bg-white dark:bg-slate-900
          inset-x-0 bottom-0 rounded-t-3xl max-h-[85dvh] shadow-2xl
          sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-20 sm:w-[26rem] sm:max-h-[min(32rem,calc(100dvh-6rem))] sm:rounded-2xl sm:shadow-xl sm:ring-1 sm:ring-slate-200 dark:sm:ring-slate-700
        "
        style={{ animation: 'notification-in 160ms ease-out' }}
      >
        <style>{`
          @keyframes notification-in {
            from { opacity: 0; transform: translateY(12px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (min-width: 640px) {
            @keyframes notification-in {
              from { opacity: 0; transform: translateY(-8px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          }
        `}</style>

        {/* Mobile drag handle */}
        <div className="flex justify-center pt-2 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Newspaper className="h-4 w-4 text-indigo-500" />
            {t('recentNews')}
            {notifications.length > 0 && (
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                ({notifications.length})
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="sm:hidden p-1 -mr-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Kapat"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 min-h-0 overscroll-contain">
          {visibleNotifications.length > 0 ? (
            visibleNotifications.map((article) => {
              const isNew = !viewedAtOpen.has(article.id);
              return (
                <button
                  key={article.id}
                  onClick={() => {
                    router.push(`/admin/news/${article.id}/edit`);
                    onClose();
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30 active:bg-indigo-100 dark:active:bg-indigo-950/50 transition-colors text-left border-b border-slate-50 dark:border-slate-800/50 last:border-b-0 ${
                    isNew ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/40 shrink-0">
                    <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    {isNew && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug text-slate-900 dark:text-slate-100 line-clamp-2">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {article.isBreaking && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950 px-1.5 py-0.5 rounded-full">
                          <Zap className="h-2.5 w-2.5" />
                          {t('newsPage.breakingNews', { fallback: 'Son Dakika' })}
                        </span>
                      )}
                      {article.isFeatured && !article.isBreaking && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950 px-1.5 py-0.5 rounded-full">
                          <Star className="h-2.5 w-2.5" />
                          {t('newsPage.featured', { fallback: 'Öne Çıkan' })}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 ml-auto">
                        <Clock className="h-3 w-3" />
                        {relativeTime(article.publishedAt ?? undefined)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                <BellOff className="h-6 w-6 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {t('newsPage.noNews', { fallback: 'Henüz haber yok' })}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {locale === 'en'
                  ? 'New articles will appear here'
                  : 'Yeni haberler burada görünecek'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {(hasMore || notifications.length > 0) && (
          <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between flex-shrink-0">
            {hasMore ? (
              <button
                onClick={onShowAll}
                className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                {t('showMore', { fallback: 'Daha Fazla Göster' })} (
                {notifications.length - visibleNotifications.length})
              </button>
            ) : (
              <span />
            )}
            <button
              onClick={() => {
                router.push('/admin/news');
                onClose();
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
            >
              {t('newsPage.seeAll', { fallback: 'Tümünü Gör →' })}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
