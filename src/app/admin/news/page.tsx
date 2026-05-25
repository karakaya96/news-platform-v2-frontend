'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
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
  Eye,
  MoreHorizontal,
  Image as ImageIcon,
  Star,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import type { News, PaginatedNews } from '@/types';

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

export default function NewsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [articles, setArticles] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [status, setStatus] = useState(searchParams.get('status') || 'all');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (status !== 'all') params.set('status', status);
      if (search) params.set('search', search);

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
  }, [page, status, search]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Haberler</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{total} toplam haber</p>
        </div>
        <Link href="/admin/news/new">
          <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-500/25 hover:shadow-lg transition-all duration-200 rounded-xl px-5">
<Plus className="mr-2 h-4 w-4" /> Yeni Haber
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Haber ara..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 focus:border-indigo-300 focus:ring-indigo-200"
          />
        </div>
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <SelectValue placeholder="Tüm Durumlar" />
          </SelectTrigger>
          <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
            <SelectItem value="all">Tüm Durumlar</SelectItem>
<SelectItem value="published">Yayında</SelectItem>
            <SelectItem value="draft">Taslak</SelectItem>
<SelectItem value="archived">Arşiv</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Başlık
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase hidden md:table-cell">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase hidden lg:table-cell">
                  Tarih
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                  İşlemler
                </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {article.image_url ? (
                            <div className="h-11 w-11 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                              <img
                                src={article.image_url}
                                alt=""
                                className="h-full w-full object-cover"
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
                              {article.excerpt && !article.is_featured && !article.is_breaking && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[250px]">
                                  {article.excerpt}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        {article.category_name ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {article.category_name}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={`${statusColors[article.status] || ''} text-xs font-medium rounded-full px-2.5 py-0.5`}
                        >
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${statusDots[article.status] || 'bg-slate-400'}`} />
                          {article.status === "published" ? "Yayında" : article.status === "draft" ? "Taslak" : article.status === "archived" ? "Arşiv" : article.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDate(
                            article.published_at || article.updated_at
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/news/${article.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950 rounded-lg transition-colors"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1.5" />
                              Düzenle
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950 rounded-lg transition-colors"
                            onClick={() => setDeleteId(article.id)}
                          >
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sayfa <span className="font-semibold text-slate-700 dark:text-slate-300">{page}</span> /{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              Sonraki
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
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
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-xl"
            >
              {deleting ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
