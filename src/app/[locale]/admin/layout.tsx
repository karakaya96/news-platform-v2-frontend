'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { getAuthToken, setAuthToken } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('admin');
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  const getPageTitle = (path: string): string => {
    if (path.endsWith('/admin/dashboard')) return t('dashboard');
    if (path.endsWith('/admin/news') || path.endsWith('/admin/news/')) return t('news');
    if (path.endsWith('/admin/news/new')) return t('newNews');
    if (path.includes('/admin/news/fetch')) return t('fetchNews', { fallback: 'Haber Çek' });
    if (path.includes('/admin/news/') && path.includes('/edit')) return t('editNews');
    if (path.endsWith('/admin/categories') || path.endsWith('/admin/categories/')) return t('categories');
    if (path.endsWith('/admin/categories/new')) return t('newCategory');
    if (path.includes('/admin/categories/') && path.includes('/edit')) return t('editCategory');
    if (path.endsWith('/admin/comments')) return t('comments');
    if (path.endsWith('/admin/notifications')) return t('notifications');
    if (path.endsWith('/admin/settings')) return t('settings');
    if (path.endsWith('/admin/users') || path.endsWith('/admin/users/')) return t('usersPage.title', { fallback: 'Kullanıcılar' });
    if (path.endsWith('/admin/users/new')) return t('usersPage.createUser', { fallback: 'Yeni Kullanıcı' });
    if (path.includes('/admin/users/') && path.includes('/edit')) return t('usersPage.editUser', { fallback: 'Kullanıcı Düzenle' });
    if (path.endsWith('/admin/profile')) return t('profilePage.title', { fallback: 'Profilim' });
    return t('management');
  };

  const isLoginPage = pathname.endsWith('/admin/login');

  useEffect(() => {
    // Don't check auth on login page
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    // Check auth but don't block rendering - let children handle their own loading
    const authenticated = isAuthenticated();
    if (!authenticated) {
      // Small delay to allow hydration, then redirect
      const timer = setTimeout(() => {
        router.push('/admin/login');
      }, 100);
      return () => clearTimeout(timer);
    }

    // Set auth token for API calls
    const token = getAuthToken() || localStorage.getItem('admin_token');
    if (token) {
      setAuthToken(token);
    }

    setChecking(false);
  }, [isLoginPage, router]);

  // Login page doesn't need the admin layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Render children immediately - they handle their own loading/auth states
  // Only show full-screen spinner during initial hydration check
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
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
