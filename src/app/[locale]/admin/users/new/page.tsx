'use client';

export const dynamic = 'force-dynamic';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

export default function NewUserPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const currentUser = getUser();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'editor' as string,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (currentUser?.role !== 'admin') {
    router.push('/admin/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await api.post('/api/users', form);
      if (res.success) {
        router.push('/admin/users');
      } else {
        setError(res.error || t('usersPage.createError'));
      }
    } catch {
      setError(t('usersPage.createError'));
    }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('usersPage.createUser')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('usersPage.createUserSubtitle')}</p>
        </div>
      </div>

      <Card className="border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-indigo-500" />
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
                placeholder={t('usersPage.namePlaceholder')}
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
                placeholder={t('usersPage.emailPlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('usersPage.password')} *</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={t('usersPage.passwordPlaceholder')}
                required
                minLength={6}
              />
              <p className="text-xs text-slate-400">{t('usersPage.passwordHint')}</p>
            </div>

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

            <div className="flex items-center gap-3 pt-3">
              <Button type="submit" disabled={saving} className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white">
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('usersPage.creating') : t('usersPage.createUser')}
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
