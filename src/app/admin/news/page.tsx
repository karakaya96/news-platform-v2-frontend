'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDateWithTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  Star,
  Zap,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { toast } from 'sonner';
import type { News } from '@/types';
import { translateCategoryName } from '@/lib/constants';

const statusColors: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  draft: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  archived: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
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
  const router = useRouter();
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  // Filters
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [featured, setFeatured] = useState(searchParams.get('featured') || '');
  const [breaking, setBreaking] = useState(searchParams.get('breaking') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [jumpPage, setJumpPage] = useState('');

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch categories for filter dropdown
  useEffect(() => {
    api.get<CategoryOption[]>('/api/categories').then((res) => {
      if (res.success && res.data) {
        setCategories(Array.isArray(res.data) ? res.data : []);
      }
    });
  }, []);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (status) params.set('status', status);
      if (category) params.set('category', category);
      if (search) params.set('search', search);
      if (featured) params.set('featured', featured);
      if (breaking) params.set('breaking', breaking);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (sortBy) params.set('sortBy', sortBy);

      const res = await api.get<News[]>(`/api/news?${params.toString()}`);
      if (res.success && res.data) {
        setArticles(Array.isArray(res.data) ? res.data : []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotal(res.pagination?.total || 0);
      } else {
        toast.error('Haberler yüklenemedi');
      }
    } catch {
      toast.error('Haberler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [page, status, category, search, featured, breaking, dateFrom, dateTo, sortBy]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/api/news/${deleteId}`);
      if (res.success) {
        toast.success('Haber silindi');
        setArticles((prev) => prev.filter((a) => a.id !== deleteId));
        setTotal((prev) => prev - 1);
      } else {
        toast.error(res.error || 'Silme başarısız');
      }
    } catch {
      toast.error('Haber silinemedi');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleJumpPage = () => {
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setPage(p);
      setJumpPage('');
    }
  };

  const resetFilters = () => {
    setStatus('all');
    setCategory('');
    setSearch('');
    setFeatured('');
    setBreaking('');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
    setPage(1);
  };

  const activeFilterCount = [category, featured, breaking, dateFrom, dateTo].filter(Boolean).length;

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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Haberler</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{total} toplam haber</p>
        </div>
        <Link href="/admin/news/new">
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg transition-all duration-200 rounded-xl px-5">
            <Plus className="mr-2 h-4 w-4" /> Yeni Haber
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
                placeholder="Haber ara..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </div>
            <Select
              value={status}
              onValueChange={(val) => { setStatus(val); setPage(1); }}
            >
              <SelectTrigger className="w-[150px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="published">Yayında</SelectItem>
                <SelectItem value="draft">Taslak</SelectItem>
                <SelectItem value="archived">Arşiv</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(val) => { setSortBy(val); setPage(1); }}
            >
              <SelectTrigger className="w-[170px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder="Sıralama" />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="newest">En Yeni</SelectItem>
                <SelectItem value="oldest">En Eski</SelectItem>
                <SelectItem value="views">En Çok Görüntülenen</SelectItem>
                <SelectItem value="title_asc">A-Z</SelectItem>
                <SelectItem value="title_desc">Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Row 2: Category + Featured + Breaking + Date range */}
          <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Select
              value={category}
              onValueChange={(val) => { setCategory(val); setPage(1); }}
            >
              <SelectTrigger className="w-[160px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder="Tüm Kategoriler" />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="">Tüm Kategoriler</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>
                    {translateCategoryName(cat.slug, cat.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={featured}
              onValueChange={(val) => { setFeatured(val); setPage(1); }}
            >
              <SelectTrigger className="w-[150px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder="Öne Çıkan" />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="">Tümü</SelectItem>
                <SelectItem value="1">Öne Çıkan</SelectItem>
                <SelectItem value="0">Öne Çıkan Değil</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={breaking}
              onValueChange={(val) => { setBreaking(val); setPage(1); }}
            >
              <SelectTrigger className="w-[150px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder="Son Dakika" />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="">Tümü</SelectItem>
                <SelectItem value="1">Son Dakika</SelectItem>
                <SelectItem value="0">Son Dakika Değil</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-[150px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Tarihten"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-[150px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Tarihe"
            />

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Filtreleri Temizle ({activeFilterCount})
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
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Haber bulunamadı</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Filtrelerinizi değiştirmeyi veya yeni bir haber oluşturmayı deneyin</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Başlık</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase hidden md:table-cell">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Durum</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase hidden lg:table-cell">Tarih & Saat</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">İşlemler</th>
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
                          {article.image_url ? (
                            <div className="h-11 w-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                              <img src={article.image_url} alt="" className="h-full w-full object-cover" />
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
                              {article.is_featured === 1 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-950 px-1.5 py-0.5 rounded-full">
                                  <Star className="h-2.5 w-2.5" />
                                  Öne Çıkan
                                </span>
                              )}
                              {article.is_breaking === 1 && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950 px-1.5 py-0.5 rounded-full">
                                  <Zap className="h-2.5 w-2.5" />
                                  Son Dakika
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {article.category_name ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {translateCategoryName(article.category_slug ?? '', article.category_name)}
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
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${statusDots[article.status] || 'bg-slate-400'}`} />
                          {article.status === 'published' ? 'Yayında' : article.status === 'draft' ? 'Taslak' : article.status === 'archived' ? 'Arşiv' : article.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDateWithTime(article.published_at || article.updated_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/news/${article.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-8 px-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950 rounded-lg transition-colors">
                              <Edit className="h-3.5 w-3.5 mr-1.5" />
                              Düzenle
                            </Button>
                          </Link>
                          <Button variant="ghost" size="sm" className="h-8 px-3 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950 rounded-lg transition-colors" onClick={() => setDeleteId(article.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sayfa <span className="font-semibold text-slate-700 dark:text-slate-300">{page}</span> /{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
            {' '}({total} haber)
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
            {getPageNumbers().map((p, i) =>
              p === '...' ? (
                <span key={`dots-${i}`} className="px-2 text-slate-400">…</span>
              ) : (
                <Button
                  key={p}
                  variant={page === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={`rounded-lg min-w-[36px] ${page === p
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
              <span className="text-xs text-slate-400 mr-1">Git:</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleJumpPage(); }}
                className="w-14 h-8 text-center text-xs rounded-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 px-1"
                placeholder="№"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleJumpPage}
                disabled={!jumpPage || parseInt(jumpPage) < 1 || parseInt(jumpPage) > totalPages}
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
            <DialogTitle className="text-lg dark:text-slate-100">Haberi Sil</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Bu haberi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteId(null)} className="dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300">
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="rounded-xl">
              {deleting ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
