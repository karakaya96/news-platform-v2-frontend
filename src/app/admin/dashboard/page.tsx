'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle2,
  FileEdit,
  FolderOpen,
  Plus,
  Settings,
  TrendingUp,
  Eye,
  BarChart3,
  ArrowRight,
  Calendar,
  Activity,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import type { News } from '@/types';
import { translateCategoryName } from '@/lib/constants';

interface DashboardStats {
  totalNews: number;
  totalCategories: number;
  publishedCount: number;
  draftCount: number;
  recentNews: News[];
  categoryDistribution?: { id: number; name: string; slug: string; color: string; article_count: number }[];
}

const statusColors: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  draft: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  archived: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

const statusLabels: Record<string, string> = {
  published: 'Yayında',
  draft: 'Taslak',
  archived: 'Arşiv',
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <>{display.toLocaleString('tr-TR')}</>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get<DashboardStats>('/api/dashboard/stats');
        if (res.success && res.data) {
          setStats(res.data);
        } else {
          toast.error('Panel verileri yüklenemedi');
        }
      } catch (err) {
        toast.error('Panel verileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const publishedCount = stats?.publishedCount ?? 0;
  const draftCount = stats?.draftCount ?? 0;
  const totalViews = (stats?.recentNews || []).reduce((sum, n) => sum + (n.view_count || 0), 0);
  const thisWeekNews = (stats?.recentNews || []).filter((n) => {
    if (!n.published_at && !n.created_at) return false;
    const d = new Date(n.published_at || n.created_at);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md rounded-2xl">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-3" />
                <Skeleton className="h-9 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="border-0 shadow-md rounded-2xl">
          <CardContent className="p-6">
            <Skeleton className="h-6 w-40 mb-6" />
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full mb-3 rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Haber',
      value: stats?.totalNews ?? 0,
      icon: FileText,
      gradient: 'from-indigo-500 via-indigo-600 to-violet-600',
      iconBg: 'bg-white/20',
      subtitle: `${thisWeekNews} bu hafta`,
    },
    {
      title: 'Yayında',
      value: publishedCount,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
      iconBg: 'bg-white/20',
      subtitle: `${totalViews} toplam görüntülenme`,
    },
    {
      title: 'Taslak',
      value: draftCount,
      icon: FileEdit,
      gradient: 'from-amber-500 via-amber-600 to-orange-600',
      iconBg: 'bg-white/20',
      subtitle: 'Yayınlanmayı bekliyor',
    },
    {
      title: 'Kategoriler',
      value: stats?.totalCategories ?? 0,
      icon: FolderOpen,
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-600',
      iconBg: 'bg-white/20',
      subtitle: 'Aktif kategori',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group`}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-0" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} backdrop-blur-sm`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-white/80 mb-1">{card.title}</p>
              <p className="text-3xl font-bold tracking-tight">
                <AnimatedNumber value={card.value} />
              </p>
              <p className="text-xs text-white/60 mt-2">{card.subtitle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Bu Hafta */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/news/new">
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 rounded-xl px-5">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Haber
          </Button>
        </Link>
        <Link href="/admin/categories">
          <Button variant="outline" className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 rounded-xl px-5 transition-all duration-200">
            <Settings className="mr-2 h-4 w-4" />
            Kategorileri Yönet
          </Button>
        </Link>
      </div>

      {/* Category Distribution */}
      {stats?.categoryDistribution && stats.categoryDistribution.length > 0 && (
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50 px-6 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              Kategori Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2">
              {stats.categoryDistribution.map((cat) => (
                <span
                  key={cat.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm"
                  style={{ backgroundColor: cat.color || '#6366f1' }}
                >
                  {translateCategoryName(cat.slug, cat.name)}
                  <span className="bg-white/30 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {cat.article_count}
                  </span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Son Aktivite Timeline */}
      {stats?.recentNews && stats.recentNews.length > 0 && (
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50 px-6 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Son Aktivite
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats.recentNews.slice(0, 5).map((article, index) => (
                <div key={article.id} className="flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${article.status === 'published' ? 'bg-emerald-500' : article.status === 'draft' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                    {index < 4 && <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{article.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`${statusColors[article.status] || ''} text-xs font-medium rounded-full px-2.5 py-0.5`}
                      >
                        {statusLabels[article.status] || article.status}
                      </Badge>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(article.published_at || article.created_at)}
                      </span>
                      {article.author_name && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">yazan: {article.author_name}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Articles Table */}
      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              Son Haberler
            </CardTitle>
            <Link href="/admin/news">
              <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950 rounded-lg">
                Tümünü Gör
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Haber
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentNews || []).slice(0, 5).map((article, index) => (
                  <tr
                    key={article.id}
                    className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {article.image_url ? (
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                            <img
                              src={article.image_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-indigo-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[250px]">
                            {article.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            yazan: {article.author_name || 'Bilinmiyor'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {article.category_name ? translateCategoryName(article.category_slug ?? '', article.category_name) : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${statusColors[article.status] || ''} text-xs font-medium rounded-full px-2.5 py-0.5`}
                      >
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${article.status === 'published' ? 'bg-emerald-500' : article.status === 'draft' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        {statusLabels[article.status] || article.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(
                          article.published_at || article.created_at
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!stats?.recentNews || stats.recentNews.length === 0) && (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Henüz haber yok</p>
              <p className="text-sm mt-1">İlk haberinizi oluşturarak başlayın</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
