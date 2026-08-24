'use client';

import { Bell, LogOut, Menu, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api, setAuthToken } from '@/lib/api';
import { getUser, removeToken } from '@/lib/auth';
import { getAvatarUrl } from '@/lib/utils';
import type { User } from '@/types';

interface AdminHeaderProps {
  title: string;
  onMenuToggle: () => void;
  onNotificationToggle: () => void;
  unreadCount: number;
}

export function AdminHeader({
  title,
  onMenuToggle,
  onNotificationToggle,
  unreadCount,
}: AdminHeaderProps) {
  const t = useTranslations('admin');
  const router = useRouter();
  const user = getUser();
  const role = user?.role || 'viewer';
  const isAdmin = role === 'admin';
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get<User>('/api/auth/profile');
        if (res.success && res.data) {
          setProfile(res.data);
        }
      } catch {}
    }
    fetchProfile();
  }, []);

  const handleLogout = () => {
    removeToken();
    setAuthToken(null);
    router.push('/admin/login');
  };

  const formatCount = (n: number): string => {
    if (n > 99) return '99+';
    return String(n);
  };

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
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl"
            onClick={() => router.push('/admin/settings')}
            title={t('settings')}
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}

        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:bg-slate-800 rounded-xl"
            onClick={onNotificationToggle}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 px-1">
                {formatCount(unreadCount)}
              </span>
            )}
          </Button>
        )}

        <div className="hidden sm:flex items-center gap-3 ml-2 pl-3 border-l border-slate-200 dark:border-slate-700">
          <button
            onClick={() => router.push('/admin/profile')}
            className="flex h-9 w-9 items-center justify-center rounded-full overflow-hidden hover:ring-2 hover:ring-indigo-300 transition-all"
          >
            <img
              src={getAvatarUrl(profile?.avatarUrl, profile?.name || user?.name || 'Admin')}
              alt={profile?.name || user?.name || 'Admin'}
              className="h-full w-full object-cover"
            />
          </button>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {user?.name || 'Admin'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('admin', { fallback: 'Yönetici' })}
            </p>
          </div>
        </div>

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
