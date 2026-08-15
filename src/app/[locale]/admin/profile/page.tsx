'use client';

export const dynamic = 'force-dynamic';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getUser, setToken, removeToken } from '@/lib/auth';
import { setAuthToken } from '@/lib/api';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Save, Shield, Edit3, PenTool, Eye, Lock, User as UserIcon } from 'lucide-react';

const ROLE_BADGES: Record<string, { color: string; icon: typeof Shield; tr: string; en: string }> = {
  admin: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: Shield, tr: 'Yönetici', en: 'Admin' },
  editor: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Edit3, tr: 'Editör', en: 'Editor' },
  author: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: PenTool, tr: 'Yazar', en: 'Author' },
  viewer: { color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', icon: Eye, tr: 'Gözlemci', en: 'Viewer' },
};

export default function ProfilePage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const currentUser = getUser();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', avatar_url: '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get<User>('/api/auth/profile');
        if (res.success && res.data) {
          setProfile(res.data);
          setForm({ name: res.data.name, avatar_url: res.data.avatarUrl || '' });
        }
      } catch {}
      setLoading(false);
    }
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await api.put<User>('/api/users/profile/update', form);
      if (res.success && res.data) {
        setProfile(res.data);
        setSuccess(t('profilePage.profileUpdated'));
        // Update cached user
        const cachedUser = getUser();
        if (cachedUser) {
          cachedUser.name = res.data.name;
          localStorage.setItem('admin_user', JSON.stringify(cachedUser));
        }
      } else {
        setError(res.error || t('profilePage.updateError'));
      }
    } catch {
      setError(t('profilePage.updateError'));
    }
    setSaving(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setError(t('profilePage.passwordMismatch'));
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setError(t('profilePage.passwordTooShort'));
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put('/api/users/profile/update', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      if (res.success) {
        setSuccess(t('profilePage.passwordUpdated'));
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        setError(res.error || t('profilePage.passwordUpdateError'));
      }
    } catch {
      setError(t('profilePage.passwordUpdateError'));
    }
    setSavingPassword(false);
  };

  const handleLogout = () => {
    removeToken();
    setAuthToken(null);
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleCfg = profile ? ROLE_BADGES[profile.role] || ROLE_BADGES.viewer : ROLE_BADGES.viewer;
  const RoleIcon = roleCfg.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('profilePage.title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('profilePage.subtitle')}</p>
      </div>

      {/* Profile Info Card */}
      <Card className="border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-indigo-500" />
            {t('profilePage.personalInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Role badge display */}
          <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xl font-bold">
              {profile?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">{profile?.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email}</p>
              <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleCfg.color}`}>
                <RoleIcon className="h-3 w-3" />
                {locale === 'en' ? roleCfg.en : roleCfg.tr}
              </span>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            {success && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
              </div>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t('profilePage.name')}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('profilePage.email')}</Label>
              <Input id="email" value={profile?.email || ''} disabled className="bg-slate-50 dark:bg-slate-800/50" />
              <p className="text-xs text-slate-400">{t('profilePage.emailHint')}</p>
            </div>

            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white">
              <Save className="h-4 w-4 mr-2" />
              {saving ? t('profilePage.saving') : t('profilePage.save')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card className="border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            {t('profilePage.changePassword')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="current_password">{t('profilePage.currentPassword')}</Label>
              <Input
                id="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_password">{t('profilePage.newPassword')}</Label>
              <Input
                id="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">{t('profilePage.confirmPassword')}</Label>
              <Input
                id="confirm_password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={savingPassword} variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400">
              <Lock className="h-4 w-4 mr-2" />
              {savingPassword ? t('profilePage.updating') : t('profilePage.updatePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800/50">
        <CardHeader>
          <CardTitle className="text-lg text-red-600 dark:text-red-400">{t('profilePage.dangerZone')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{t('profilePage.logoutHint')}</p>
          <Button variant="destructive" onClick={handleLogout}>
            {t('logout')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
