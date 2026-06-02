'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, BellOff, Mail, MailOpen, Trash2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  browserSubscriptions: number;
  emailSubscriptions: number;
  notificationsSent: number;
}

interface Subscription {
  id: number;
  type: 'browser' | 'email';
  email: string | null;
  categories: string[];
  is_active: number;
  created_at: string;
}

interface NotificationLog {
  id: number;
  type: 'browser' | 'email';
  title: string;
  body: string;
  url: string | null;
  status: 'pending' | 'sent' | 'failed';
  created_at: string;
}

export default function NotificationsPage() {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, subRes, notifRes] = await Promise.all([
        api.get<SubscriptionStats>('/api/subscribe/admin/stats'),
        api.get<Subscription[]>('/api/subscribe/admin/all'),
        api.get<NotificationLog[]>('/api/subscribe/admin/notifications?limit=30'),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (subRes.success && subRes.data) setSubscriptions(subRes.data);
      if (notifRes.success && notifRes.data) setNotifications(notifRes.data);
    } catch {
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteSubscription = async (id: number) => {
    if (!confirm('Bu aboneliği kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    try {
      const res = await api.delete(`/api/subscribe/admin/${id}`);
      if (res.success) {
        toast.success('Abonelik kalıcı olarak silindi');
        setSubscriptions((prev) => prev.filter((s) => s.id !== id));
      }
    } catch {
      toast.error('Silme başarısız');
    }
  };

  const handleToggleActive = async (id: number, currentStatus: number) => {
    const action = currentStatus === 1 ? 'deactivate' : 'activate';
    try {
      const res = await api.post(`/api/subscribe/admin/${id}/${action}`);
      if (res.success) {
        toast.success(currentStatus === 1 ? 'Abonelik deaktif edildi' : 'Abonelik aktif edildi');
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, is_active: currentStatus === 1 ? 0 : 1 } : s))
        );
      }
    } catch {
      toast.error('İşlem başarısız');
    }
  };

  const filteredSubs = subscriptions.filter((s) => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    if (statusFilter === 'active' && s.is_active !== 1) return false;
    if (statusFilter === 'inactive' && s.is_active !== 0) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Bildirim & Abonelik</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Abonelikleri ve bildirimleri yönetin</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900">
                  <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Toplam Abonelik</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Aktif</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.activeSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">E-posta Abone</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.emailSubscriptions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900">
                  <MailOpen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Gönderilen</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.notificationsSent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subscriptions List */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Abonelikler</CardTitle>
            <div className="flex gap-2">
              {['all', 'browser', 'email'].map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={typeFilter === type ? 'default' : 'outline'}
                  onClick={() => setTypeFilter(type)}
                  className="rounded-xl text-xs"
                >
                  {type === 'all' ? 'Tümü' : type === 'browser' ? 'Tarayıcı' : 'E-posta'}
                </Button>
              ))}
              <div className="w-px bg-slate-200 dark:bg-slate-700 mx-1" />
              {['all', 'active', 'inactive'].map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={statusFilter === status ? 'default' : 'outline'}
                  onClick={() => setStatusFilter(status)}
                  className="rounded-xl text-xs"
                >
                  {status === 'all' ? 'Tüm Durumlar' : status === 'active' ? 'Aktif' : 'Deaktif'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredSubs.length === 0 ? (
            <div className="text-center py-12">
              <BellOff className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400">Henüz abonelik yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Tip</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">E-posta</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Kategoriler</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Tarih</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map((sub) => (
                    <tr key={sub.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="rounded-full text-xs">
                          {sub.type === 'browser' ? '🔔 Tarayıcı' : '📧 E-posta'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                        {sub.email || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {sub.categories.length === 0 ? (
                            <span className="text-xs text-slate-400">Tümü</span>
                          ) : (
                            sub.categories.map((cat) => (
                              <span key={cat} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-300">
                                {cat}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    <td className="px-4 py-3">
                      <Badge variant={sub.is_active ? 'default' : 'secondary'} className="rounded-full text-xs">
                        {sub.is_active ? 'Aktif' : 'Deaktif'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(sub.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {sub.is_active ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950 rounded-lg"
                            onClick={() => handleToggleActive(sub.id, sub.is_active)}
                          >
                            <BellOff className="h-3 w-3 mr-1" />
                            Deaktif Et
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-lg"
                            onClick={() => handleToggleActive(sub.id, sub.is_active)}
                          >
                            <Bell className="h-3 w-3 mr-1" />
                            Aktif Et
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"
                          onClick={() => handleDeleteSubscription(sub.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Log */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Son Bildirimler</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400">Henüz bildirim gönderilmemiş</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map((notif) => (
                <div key={notif.id} className="px-4 py-3 flex items-center gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    notif.status === 'sent' ? 'bg-emerald-100 dark:bg-emerald-900' :
                    notif.status === 'failed' ? 'bg-red-100 dark:bg-red-900' :
                    'bg-amber-100 dark:bg-amber-900'
                  }`}>
                    {notif.status === 'sent' ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : notif.status === 'failed' ? (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{notif.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{notif.body}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="outline" className="rounded-full text-xs">
                      {notif.type === 'browser' ? 'Tarayıcı' : 'E-posta'}
                    </Badge>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(notif.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
