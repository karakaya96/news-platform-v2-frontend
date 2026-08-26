'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { NotificationDropdown } from '@/components/admin/notification-dropdown';
import { api, getAuthToken, setAuthToken } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import type { News } from '@/types';

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
  const arr = Array.from(ids).slice(-200);
  localStorage.setItem(VIEWED_KEY, JSON.stringify(arr));
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  // Notification state
  const [notifications, setNotifications] = useState<News[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const getPageTitle = (path: string): string => {
    if (path.endsWith('/admin/dashboard')) return t('dashboard');
    if (path.endsWith('/admin/news') || path.endsWith('/admin/news/')) return t('news');
    if (path.endsWith('/admin/news/new')) return t('newNews');
    if (path.includes('/admin/news/fetch')) return t('fetchNews', { fallback: 'Haber Çek' });
    if (path.includes('/admin/news/') && path.includes('/edit')) return t('editNews');
    if (path.endsWith('/admin/categories') || path.endsWith('/admin/categories/'))
      return t('categories');
    if (path.endsWith('/admin/categories/new')) return t('newCategory');
    if (path.includes('/admin/categories/') && path.includes('/edit')) return t('editCategory');
    if (path.endsWith('/admin/comments')) return t('comments');
    if (path.endsWith('/admin/notifications')) return t('notifications');
    if (path.endsWith('/admin/settings')) return t('settings');
    if (path.endsWith('/admin/users') || path.endsWith('/admin/users/'))
      return t('usersPage.title', { fallback: 'Kullanıcılar' });
    if (path.endsWith('/admin/users/new'))
      return t('usersPage.createUser', { fallback: 'Yeni Kullanıcı' });
    if (path.includes('/admin/users/') && path.includes('/edit'))
      return t('usersPage.editUser', { fallback: 'Kullanıcı Düzenle' });
    if (path.endsWith('/admin/profile')) return t('profilePage.title', { fallback: 'Profilim' });
    return t('management');
  };

  const isLoginPage = pathname.endsWith('/admin/login');

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    const authenticated = isAuthenticated();
    if (!authenticated) {
      const timer = setTimeout(() => {
        router.push('/admin/login');
      }, 100);
      return () => clearTimeout(timer);
    }

    const token = getAuthToken() || localStorage.getItem('admin_token');
    if (token) {
      setAuthToken(token);
    }

    setChecking(false);
  }, [isLoginPage, router]);

  // Fetch notifications
  useEffect(() => {
    if (isLoginPage || !isAuthenticated()) return;
    async function fetchRecentArticles() {
      try {
        const res = await api.get<News[]>('/api/news?status=published&limit=50');
        if (res.success && res.data) {
          const articles = Array.isArray(res.data) ? res.data : [];
          setNotifications(articles);
          const viewed = getViewedIds();
          const unread = articles.filter((a) => !viewed.has(a.id)).length;
          setUnreadCount(unread);
        }
      } catch {}
    }
    fetchRecentArticles();
  }, [isLoginPage]);

  const handleNotificationToggle = useCallback(() => {
    if (!showNotifications) {
      // Mark all as viewed
      const viewed = getViewedIds();
      for (const a of notifications) {
        viewed.add(a.id);
      }
      saveViewedIds(viewed);
      setUnreadCount(0);
    }
    setShowNotifications(!showNotifications);
    setShowAll(false);
  }, [showNotifications, notifications]);

  const handleCloseNotifications = useCallback(() => {
    setShowNotifications(false);
  }, []);

  const visibleNotifications = showAll ? notifications : notifications.slice(0, MAX_VISIBLE);
  const hasMore = notifications.length > MAX_VISIBLE && !showAll;

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          title={getPageTitle(pathname)}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          onNotificationToggle={handleNotificationToggle}
          unreadCount={unreadCount}
          isNotificationOpen={showNotifications}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
      <NotificationDropdown
        isOpen={showNotifications}
        onClose={handleCloseNotifications}
        notifications={notifications}
        visibleNotifications={visibleNotifications}
        hasMore={hasMore}
        showAll={showAll}
        onShowAll={() => setShowAll(true)}
      />
    </div>
  );
}
