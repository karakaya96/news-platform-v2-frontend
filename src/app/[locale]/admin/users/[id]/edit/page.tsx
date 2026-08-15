'use client';

export const dynamic = 'force-dynamic';

import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, UserCog } from 'lucide-react';

export default function EditUserPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const currentUser = getUser();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'editor' as string,
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = currentUser?.role === 'admin';
  const isSelf = currentUser?.id === id;

  useEffect(() => {
    if (!isAdmin && !isSelf) {
      router.push('/admin/dashboard');
      return;
    }
    async function fetchUser() {
      try {
        const res = await api.get<User>(`/api/users/${id}`);
        if (res.success && res.data) {
          setUser(res.data);
          setForm({
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
            password: '',
          });
        }
      } catch {}
      setLoading(false);
    }
    fetchUser();
  }, [id, isAdmin, isSelf, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const body: Record<string, string> = {
        name: form.name,
        email: form.email,
      };
      if (isAdmin) body.role = form.role;
      if (form.password) body.password = form.password;

      const res = await api.put(`/api/users/${id}`, body);
      if (res.success) {
        router.push(isAdmin ? '/admin/users' : '/admin/dashboard');
      } else {
        setError(res.error || t('usersPage.updateError'));
      }
    } catch {
      setError(t('usersPage.updateError'));
    }
    setSaving(false);
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

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-slate-500">{t('usersPage.userNotFound')}</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('usersPage.goBack')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isSelf ? t('usersPage.editProfile') : t('usersPage.editUser')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserCog className="h-5 w-5 text-indigo-500" />
            {t('usersPage.userInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">{t('usersPage.name')} *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('usersPage.email')} *</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <Label>{t('usersPage.role')} *</Label>
                <Select value={form.role} onValueChange={(val) => setForm({ ...form, role: val })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('usersPage.roleAdmin')}</SelectItem>
                    <SelectItem value="editor">{t('usersPage.roleEditor')}</SelectItem>
                    <SelectItem value="author">{t('usersPage.roleAuthor')}</SelectItem>
                    <SelectItem value="viewer">{t('usersPage.roleViewer')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-400">{t(`usersPage.roleDesc_${form.role}`)}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">{t('usersPage.newPassword')}</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={t('usersPage.passwordPlaceholder')}
                minLength={6}
              />
              <p className="text-xs text-slate-400">{t('usersPage.passwordHintEdit')}</p>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <Button type="submit" disabled={saving} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('usersPage.saving') : t('usersPage.save')}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                {t('usersPage.cancel')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
