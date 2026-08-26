'use client';

export const dynamic = 'force-dynamic';

import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Pencil,
  PenTool,
  Plus,
  Search,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';
import { getAvatarUrl } from '@/lib/utils';
import type { PaginationMeta, User } from '@/types';

const ROLE_CONFIG: Record<string, { color: string; icon: typeof Shield; tr: string; en: string }> =
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

export default function UsersPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'admin';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '20' });
        if (search) params.set('search', search);
        const res = await api.get<{ users: User[]; pagination: PaginationMeta }>(
          `/api/users?${params}`
        );
        if (res.success && res.data) {
          let filteredUsers = res.data.users || [];
          if (roleFilter !== 'all') {
            filteredUsers = filteredUsers.filter((u) => u.role === roleFilter);
          }
          setUsers(filteredUsers);
          setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
        }
      } catch {}
      setLoading(false);
    },
    [search, roleFilter]
  );

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin/dashboard');
      return;
    }
    fetchUsers(1);
  }, [isAdmin, router, fetchUsers]);

  const handleDelete = async () => {
    if (!deleteDialog.user) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/api/users/${deleteDialog.user.id}`);
      if (res.success) {
        setDeleteDialog({ open: false, user: null });
        fetchUsers(pagination.page);
      }
    } catch {}
    setDeleting(false);
  };

  const formatDate = (date: string) => {
    // Handle SQLite datetime format: parse as UTC
    const isoStr = date.includes('T') ? date : date.replace(' ', 'T') + 'Z';
    return new Date(isoStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Europe/Istanbul',
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('usersPage.subtitle')}</p>
        </div>
        <Button
          onClick={() => router.push('/admin/users/new')}
          className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-500/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('usersPage.addUser')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-700/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t('usersPage.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers(1)}
                className="pl-9"
              />
            </div>
            <Select
              value={roleFilter}
              onValueChange={(val) => {
                setRoleFilter(val);
                fetchUsers(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder={t('usersPage.allRoles')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('usersPage.allRoles')}</SelectItem>
                <SelectItem value="admin">{t('usersPage.roleAdmin')}</SelectItem>
                <SelectItem value="editor">{t('usersPage.roleEditor')}</SelectItem>
                <SelectItem value="author">{t('usersPage.roleAuthor')}</SelectItem>
                <SelectItem value="viewer">{t('usersPage.roleViewer')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-slate-200 dark:border-slate-700/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            {t('usersPage.userList')}
            <Badge variant="secondary" className="ml-2">
              {pagination.total}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">{t('usersPage.noUsers')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('usersPage.tableUser')}
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      {t('usersPage.tableEmail')}
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('usersPage.tableRole')}
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                      {t('usersPage.tableDate')}
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {t('usersPage.tableActions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {users.map((user) => {
                    const roleCfg = ROLE_CONFIG[user.role] || ROLE_CONFIG.viewer;
                    const RoleIcon = roleCfg.icon;
                    const isSelf = currentUser?.id === String(user.id);
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full overflow-hidden flex-shrink-0">
                              <img
                                src={getAvatarUrl(user.avatarUrl, user.name)}
                                alt={user.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {user.name}{' '}
                                {isSelf && (
                                  <span className="text-xs text-slate-400">
                                    ({t('usersPage.you')})
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 md:hidden">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {user.email}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${roleCfg.color}`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            {locale === 'en' ? roleCfg.en : roleCfg.tr}
                          </span>
                        </td>
                        <td className="py-3 px-4 hidden lg:table-cell">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                              onClick={() => router.push(`/admin/users/${user.id}/edit`)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {!isSelf && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600"
                                onClick={() => setDeleteDialog({ open: true, user })}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-500">
                {t('usersPage.showing')} {(pagination.page - 1) * pagination.limit + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} /{' '}
                {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchUsers(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={page === pagination.page ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => fetchUsers(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchUsers(pagination.page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('usersPage.deleteTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t('usersPage.deleteConfirm', { name: deleteDialog.user?.name || '' })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, user: null })}>
              {t('usersPage.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? t('usersPage.deleting') : t('usersPage.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
