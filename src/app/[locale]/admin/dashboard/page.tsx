'use client';

export const dynamic = 'force-dynamic';

import {
  Activity,
  Archive,
  ArrowRight,
  BarChart3,
  Bell,
  CheckCircle2,
  Clock,
  FileEdit,
  FileText,
  FolderOpen,
  MessageCircle,
  Plus,
  Settings,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { translateCategoryName } from '@/lib/constants';
import { formatDateWithTime } from '@/lib/utils';
import type { News } from '@/types';

interface DashboardStats {
  totalNews: number;
  totalCategories: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  pendingComments?: number;
  activeSubscriptions?: number;
  browserSubscriptions?: number;
  emailSubscriptions?: number;
  recentNews: News[];
  categoryDistribution?: {
    id: number;
    name: string;
    slug: string;
    color: string;
    articleCount?: number;
    article_count?: number; // Backend returns snake_case
  }[];
}

const statusColors: Record<string, string> = {
  published:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  draft:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  archived:
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplay(0);
      return;
    }
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
  const t = useTranslations('admin.dashboardPage');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const statusLabels: Record<string, string> = {
    published: t('published'),
    draft: t('draft'),
    archived: t('archived'),
  };

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get<DashboardStats>('/api/dashboard/stats');
        if (res.success && res.data) {
          setStats(res.data);
        } else {
          toast.error(t('dataLoadError'));
        }
      } catch (_err) {
        toast.error(t('dataLoadError'));
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [t]);

  const publishedCount = stats?.publishedCount ?? 0;
  const draftCount = stats?.draftCount ?? 0;
  const totalViews = (stats?.recentNews || []).reduce((sum, n) => sum + (n.viewCount || 0), 0);
  const thisWeekNews = (stats?.recentNews || []).filter((n) => {
    if (!n.publishedAt && !n.createdAt) return false;
    const d = new Date(n.publishedAt || n.createdAt);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= weekAgo;
  }).length;

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card
              key={`skeleton-statcard-${i}`}
              className="border-0 shadow-md rounded-2xl"
            >
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
              <Skeleton
                key={`skeleton-stat-${i}`}
                className="h-14 w-full mb-3 rounded-xl"
              />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      title: t('totalNews'),
      value: stats?.totalNews ?? 0,
      icon: FileText,
      gradient: 'from-indigo-500 via-indigo-600 to-violet-600',
      iconBg: 'bg-white/20',
      subtitle: `${thisWeekNews} ${t('thisWeek')}`,
    },
    {
      title: t('published'),
      value: publishedCount,
      icon: CheckCircle2,
      gradient: 'from-emerald-500 via-emerald-600 to-teal-600',
      iconBg: 'bg-white/20',
      subtitle: `${totalViews} ${t('totalViews')}`,
    },
    {
      title: t('draft'),
      value: draftCount,
      icon: FileEdit,
      gradient: 'from-amber-500 via-amber-600 to-orange-600',
      iconBg: 'bg-white/20',
      subtitle: t('waitingPublish'),
    },
    {
      title: t('archived'),
      value: stats?.archivedCount ?? 0,
      icon: Archive,
      gradient: 'from-slate-500 via-slate-600 to-gray-600',
      iconBg: 'bg-white/20',
      subtitle: t('archivedNews'),
    },
    {
      title: t('activeCategories', { fallback: 'Kategoriler' }),
      value: stats?.totalCategories ?? 0,
      icon: FolderOpen,
      gradient: 'from-violet-500 via-purple-600 to-fuchsia-600',
      iconBg: 'bg-white/20',
      subtitle: t('activeCategories'),
    },
    {
      title: t('pendingComments'),
      value: stats?.pendingComments ?? 0,
      icon: MessageCircle,
      gradient: 'from-rose-500 via-pink-600 to-red-600',
      iconBg: 'bg-white/20',
      subtitle: t('awaitingApproval'),
      href: '/admin/comments',
    },
    {
      title: t('activeSubscribers'),
      value: stats?.activeSubscriptions ?? 0,
      icon: Bell,
      gradient: 'from-blue-500 via-blue-600 to-cyan-600',
      iconBg: 'bg-white/20',
      subtitle: `${stats?.browserSubscriptions ?? 0} ${t('browser')}, ${stats?.emailSubscriptions ?? 0} ${t('emailLabel')}`,
      href: '/admin/notifications',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 group`}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-0" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-6 -translate-x-6" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.iconBg} backdrop-blur-sm`}
                >
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

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/news/new">
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-200 rounded-xl px-5">
            <Plus className="mr-2 h-4 w-4" />
            {t('newNewsButton')}
          </Button>
        </Link>
        <Link href="/admin/categories">
          <Button
            variant="outline"
            className="border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300 rounded-xl px-5 transition-all duration-200"
          >
            <Settings className="mr-2 h-4 w-4" />
            {t('manageCategories')}
          </Button>
        </Link>
      </div>

      {/* Category Distribution */}
      {stats?.categoryDistribution && stats.categoryDistribution.length > 0 && (
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50 px-6 py-4">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              {t('categoryDistribution')}
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
                    {cat.articleCount ?? cat.article_count ?? 0}
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
              {t('recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {stats.recentNews.slice(0, 5).map((article, index) => (
                <div key={article.id} className="flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${article.status === 'published' ? 'bg-emerald-500' : article.status === 'draft' ? 'bg-amber-500' : 'bg-slate-400'}`}
                    />
                    {index < 4 && <div className="w-0.5 h-8 bg-slate-200 dark:bg-slate-700 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-4">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {article.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={`${statusColors[article.status] || ''} text-xs font-medium rounded-full px-2.5 py-0.5`}
                      >
                        {statusLabels[article.status] || article.status}
                      </Badge>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateWithTime(article.publishedAt || article.createdAt)}
                      </span>
                      {article.authorName && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {article.authorName}
                        </span>
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
              {t('recentNews')}
            </CardTitle>
            <Link href="/admin/news">
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950 rounded-lg"
              >
                {t('seeAll')}
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
                    {t('tableNews')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">
                    {t('tableCategory')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('tableStatus')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">
                    {t('tableDate')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {(stats?.recentNews || []).slice(0, 5).map((article, _index) => (
                  <tr
                    key={article.id}
                    className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {article.imageUrl ? (
                          <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                            <Image
                              src={article.imageUrl}
                              alt=""
                              fill
                              className="h-full w-full object-cover"
                              sizes="40px"
                              unoptimized
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
                            {article.authorName || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        {article.categoryName
                          ? translateCategoryName(article.categorySlug ?? '', article.categoryName)
                          : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`${statusColors[article.status] || ''} text-xs font-medium rounded-full px-2.5 py-0.5`}
                      >
                        <span
                          className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${article.status === 'published' ? 'bg-emerald-500' : article.status === 'draft' ? 'bg-amber-500' : 'bg-slate-400'}`}
                        />
                        {statusLabels[article.status] || article.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDateWithTime(article.publishedAt || article.createdAt)}
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
              <p className="font-medium">{t('noNews')}</p>
              <p className="text-sm mt-1">{t('startNews')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
