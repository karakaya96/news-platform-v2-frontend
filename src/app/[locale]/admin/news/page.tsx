'use client';

// Force dynamic rendering — this page uses client-side auth and API calls
export const dynamic = 'force-dynamic';

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  FileText,
  Image as ImageIcon,
  Plus,
  Search,
  Star,
  Trash2,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { translateCategoryName } from '@/lib/constants';
import { formatDateWithTime } from '@/lib/utils';
import type { News } from '@/types';
import { useTranslations, useLocale } from 'next-intl';

const statusColors: Record<string, string> = {
  published:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  draft:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  archived:
    'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

const statusDots: Record<string, string> = {
  published: 'bg-emerald-500',
  draft: 'bg-amber-500',
  archived: 'bg-slate-400',
};

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
}

export default function NewsListPage() {
  const t = useTranslations('admin.newsPage');
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Filters
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [featured, setFeatured] = useState(searchParams.get('featured') || 'all');
  const [breaking, setBreaking] = useState(searchParams.get('breaking') || 'all');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [jumpPage, setJumpPage] = useState('');

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get<CategoryOption[]>('/api/categories');
      if (res.success && res.data) {
        setCategories(Array.isArray(res.data) ? res.data : []);
      }
    } catch {
      // Silently fail - categories are optional for filtering
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Debounce search input (300ms)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [search]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (status) params.set('status', status);
      if (category && category !== 'all') params.set('category', category);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (featured && featured !== 'all') params.set('featured', featured);
      if (breaking && breaking !== 'all') params.set('breaking', breaking);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (sortBy) params.set('sortBy', sortBy);

      const res = await api.get<News[]>(`/api/news?${params.toString()}`);
      if (res.success && res.data) {
        setArticles(Array.isArray(res.data) ? res.data : []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotal(res.pagination?.total || 0);
      } else {
        toast.error(t('loadError'));
      }
    } catch {
      toast.error(t('loadError'));
    } finally {
      setLoading(false);
    }
  }, [page, status, category, debouncedSearch, featured, breaking, dateFrom, dateTo, sortBy]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/api/news/${deleteId}`);
      if (res.success) {
        toast.success(t('deleted'));
        setArticles((prev) => prev.filter((a) => a.id !== deleteId));
        setTotal((prev) => prev - 1);
      } else {
        toast.error(res.error || t('deleteFailed'));
      }
    } catch {
      toast.error(t('deleteError'));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleJumpPage = () => {
    const p = Number.parseInt(jumpPage, 10);
    if (!Number.isNaN(p) && p >= 1 && p <= totalPages) {
      setPage(p);
      setJumpPage('');
    }
  };

  const resetFilters = () => {
    setStatus('all');
    setCategory('all');
    setSearch('');
    setFeatured('all');
    setBreaking('all');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
    setPage(1);
  };

  const activeFilterCount = [
    category !== 'all' && category,
    featured !== 'all' && featured,
    breaking !== 'all' && breaking,
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

  // Pagination helpers
  const getPageNumbers = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push('...');
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {t('title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{total} {t('totalNews')}</p>
        </div>
        <Link href="/admin/news/new">
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg transition-all duration-200 rounded-xl px-5">
            <Plus className="mr-2 h-4 w-4" /> {t('newNewsButton')}
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardContent className="p-4 space-y-3">
          {/* Row 1: Search + Status + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <Select
              value={status}
              onValueChange={(val) => {
                setStatus(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder={t('statusPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="published">{t('published')}</SelectItem>
                <SelectItem value="draft">{t('draft')}</SelectItem>
                <SelectItem value="archived">{t('archived')}</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(val) => {
                setSortBy(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[170px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder={t('sortPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="newest">{t('newest')}</SelectItem>
                <SelectItem value="oldest">{t('oldest')}</SelectItem>
                <SelectItem value="views">{t('mostViewed')}</SelectItem>
                <SelectItem value="title_asc">A-Z</SelectItem>
                <SelectItem value="title_desc">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Category + Featured + Breaking + Date range */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Select
              value={category}
              onValueChange={(val) => {
                setCategory(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[160px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder={t('categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="all">{t('categoryPlaceholder')}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {translateCategoryName(cat.slug, cat.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={featured}
              onValueChange={(val) => {
                setFeatured(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder={t('featuredPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="1">{t('featured')}</SelectItem>
                <SelectItem value="0">{t('notFeatured')}</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={breaking}
              onValueChange={(val) => {
                setBreaking(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder={t('breakingPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="all">{t('all')}</SelectItem>
                <SelectItem value="1">{t('breakingNews')}</SelectItem>
                <SelectItem value="0">{t('notBreaking')}</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-[150px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder={t('fromDate')}
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-[150px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder={t('toDate')}
            />

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                {t('clearFilters')} ({activeFilterCount})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: Skeleton placeholders are static, index is fine
                  key={`skeleton-news-${i}`}
                  className="h-16 w-full rounded-xl"
                />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
                {t('noNews')}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                {t('noNewsDetail')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                      {t('tableTitle')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase hidden md:table-cell">
                      {t('tableCategory')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                      {t('tableStatus')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase hidden lg:table-cell">
                      {t('tableDate')}
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                      {t('tableActions')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors duration-150"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {article.imageUrl ? (
                            <div className="h-11 w-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700 relative">
                              <Image
                                src={article.imageUrl}
                                alt=""
                                fill
                                className="h-full w-full object-cover"
                                sizes="44px"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                              <ImageIcon className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate max-w-[280px]">
                              {article.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              {article.isFeatured && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950 px-1.5 py-0.5 rounded-full">
                                  <Star className="h-2.5 w-2.5" />
                                  {t('featured')}
                                </span>
                              )}
                              {article.isBreaking && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950 px-1.5 py-0.5 rounded-full">
                                  <Zap className="h-2.5 w-2.5" />
                                  {t('breakingNews')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {article.categoryName ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {translateCategoryName(
                              article.categorySlug ?? '',
                              article.categoryName,
                              locale
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={`${statusColors[article.status] || ''} text-xs font-medium rounded-full px-2.5 py-0.5`}
                        >
                          <span
                            className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${statusDots[article.status] || 'bg-slate-400'}`}
                          />
                          {article.status === 'published'
                            ? t('published')
                            : article.status === 'draft'
                              ? t('draft')
                              : article.status === 'archived'
                                ? t('archived')
                                : article.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDateWithTime(article.publishedAt || article.updatedAt)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/news/${article.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950 rounded-lg transition-colors"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1.5" />
                              {t('editButton')}
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950 rounded-lg transition-colors"
                            onClick={() => setDeleteId(article.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            {t('deleteButton')}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t('page')} <span className="font-semibold text-slate-700 dark:text-slate-300">{page}</span> /{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span> (
            {total} {t('newsCount')})
          </p>
          <div className="flex items-center gap-1">
            {/* First */}
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(1)}
              className="rounded-lg border-slate-200 dark:border-slate-700 dark:text-slate-300 px-2"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            {/* Prev */}
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border-slate-200 dark:border-slate-700 dark:text-slate-300 px-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {getPageNumbers().map((p, _i) =>
              p === '...' ? (
                <span key={`ellipsis-${p}`} className="px-2 text-slate-400">
                  …
                </span>
              ) : (
                <Button
                  key={`page-${p}`}
                  variant={page === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={`rounded-lg min-w-[36px] ${
                    page === p
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600'
                      : 'border-slate-200 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {p}
                </Button>
              )
            )}

            {/* Next */}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border-slate-200 dark:border-slate-700 dark:text-slate-300 px-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            {/* Last */}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="rounded-lg border-slate-200 dark:border-slate-700 dark:text-slate-300 px-2"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>

            {/* Jump to page */}
            <div className="flex items-center gap-1 ml-2">
              <span className="text-xs text-slate-400 mr-1">{t('goto')}</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJumpPage();
                }}
                className="w-14 h-8 text-center text-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-1"
                placeholder="№"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleJumpPage}
                disabled={
                  !jumpPage ||
                  Number.parseInt(jumpPage, 10) < 1 ||
                  Number.parseInt(jumpPage, 10) > totalPages
                }
                className="h-8 px-2 text-xs rounded-lg"
              >
                →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-2xl dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-lg dark:text-slate-100">{t('deleteDialog.title')}</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t('deleteDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className="dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              {t('deleteDialog.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl"
            >
              {deleting ? t('deleteDialog.deleting') : t('deleteDialog.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
