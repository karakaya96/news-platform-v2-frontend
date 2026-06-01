'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { setAuthToken, getAuthToken } from '@/lib/api';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Gösterge Paneli',
  '/admin/news': 'Haberler',
  '/admin/news/new': 'Yeni Haber',
  '/admin/categories': 'Kategoriler',
  '/admin/categories/new': 'Yeni Kategori',
  '/admin/comments': 'Yorumlar',
  '/admin/notifications': 'Bildirimler',
};

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname];
  if (pathname.includes('/edit')) return 'Haberi Düzenle';
  return 'Yönetim';
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Don't check auth on login page
    if (pathname === '/admin/login') {
      setChecking(false);
      return;
    }

    if (!isAuthenticated()) {
      router.push('/admin/login');
      return;
    }

    // Set auth token for API calls
    const token = getAuthToken() || localStorage.getItem('admin_token');
    if (token) {
      setAuthToken(token);
    }

    setChecking(false);
  }, [pathname, router]);

  // Login page doesn't need the admin layout
  if (pathname === '/admin/login') {
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
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
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
