'use client';

export const dynamic = 'force-dynamic';

import { Edit3, Eye, Lock, PenTool, Save, Shield, Trash2, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { AvatarPicker } from '@/components/admin/avatar-picker';
import { MediaLibrary } from '@/components/admin/media-library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, setAuthToken } from '@/lib/api';
import { removeToken } from '@/lib/auth';
import { getAvatarUrl } from '@/lib/utils';
import type { User } from '@/types';

const ROLE_BADGES: Record<string, { color: string; icon: typeof Shield; tr: string; en: string }> =
  {
    admin: {
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      icon: Shield,
      tr: 'Yönetici',
      en: 'Admin',
    },
    editor: {
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      icon: Edit3,
      tr: 'Editör',
      en: 'Editor',
    },
    author: {
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      icon: PenTool,
      tr: 'Yazar',
      en: 'Author',
    },
    viewer: {
      color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
      icon: Eye,
      tr: 'Gözlemci',
      en: 'Viewer',
    },
  };

export default function ProfilePage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', avatar_url: '' });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

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

  const handleAvatarChange = (url: string) => {
    setForm((prev) => ({ ...prev, avatar_url: url }));
  };

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
        // Reload to update header avatar
        setTimeout(() => window.location.reload(), 500);
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t('profilePage.title')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('profilePage.subtitle')}
        </p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">{t('profilePage.tabs.personal')}</TabsTrigger>
          <TabsTrigger value="media">{t('profilePage.tabs.media')}</TabsTrigger>
          <TabsTrigger value="password">{t('profilePage.tabs.password')}</TabsTrigger>
          <TabsTrigger value="danger">{t('profilePage.tabs.danger')}</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          {/* Profile Info Card */}
          <Card className="border-slate-200 dark:border-slate-700/50 mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-indigo-500" />
                {t('profilePage.personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Avatar Picker */}
              <div className="mb-6">
                <AvatarPicker
                  currentAvatar={profile?.avatarUrl || null}
                  userName={profile?.name || 'User'}
                  onAvatarChange={handleAvatarChange}
                />
              </div>

              {/* Role badge display */}
              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                <div className="h-14 w-14 rounded-full overflow-hidden">
                  {/* biome-ignore lint/performance/noImgElement: <explanation>Avatar via R2 proxy, already optimized</explanation> */}
                  <img
                    src={getAvatarUrl(profile?.avatarUrl, profile?.name || 'User')}
                    alt={profile?.name || 'User'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                    {profile?.name}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email}</p>
                  <span
                    className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${roleCfg.color}`}
                  >
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
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-slate-50 dark:bg-slate-800/50"
                  />
                  <p className="text-xs text-slate-400">{t('profilePage.emailHint')}</p>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? t('profilePage.saving') : t('profilePage.save')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <MediaLibrary />
        </TabsContent>

        <TabsContent value="password">
          {/* Password Change Card */}
          <Card className="border-slate-200 dark:border-slate-700/50 mt-4">
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
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, current_password: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">{t('profilePage.newPassword')}</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, new_password: e.target.value })
                    }
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
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                    }
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={savingPassword}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {savingPassword ? t('profilePage.updating') : t('profilePage.updatePassword')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger">
          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-800/50 mt-4">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <Trash2 className="h-5 w-5" />
                {t('profilePage.dangerZone')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                {t('profilePage.logoutHint')}
              </p>
              <Button variant="destructive" onClick={handleLogout}>
                {t('logout')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
