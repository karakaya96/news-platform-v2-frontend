'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Category } from '@/types';
import { translateCategoryName, translateCategoryDescription } from '@/lib/constants';

export default function KategorilerPage() {
  const [categories, setKategoriler] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchKategoriler = useCallback(async () => {
    try {
      const res = await api.get<Category[]>('/api/categories');
      if (res.success && res.data) {
        setKategoriler(res.data);
      } else {
        toast.error('Kategoriler yüklenemedi');
      }
    } catch {
      toast.error('Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKategoriler();
  }, [fetchKategoriler]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/api/categories/${deleteId}`);
      if (res.success) {
        toast.success('Kategori silindi');
        setKategoriler((prev) => prev.filter((c) => c.id !== Number(deleteId)));
      } else {
        toast.error(res.error || 'Kategori silinemedi');
      }
    } catch {
      toast.error('Kategori silinemedi');
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
          <h2 className="text-2xl font-bold dark:text-slate-100">Kategoriler</h2>
          <p className="text-muted-foreground dark:text-slate-400">
            {categories.length} kategori
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button className="dark:bg-primary dark:text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kategori
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card className="dark:bg-card dark:border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground dark:text-slate-400">
              Henüz kategori yok. İlk kategorinizi oluşturun!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700 text-left">
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground dark:text-slate-400">
                      Renk
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground dark:text-slate-400">
                      Ad
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground dark:text-slate-400 hidden sm:table-cell">
                      Slug
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground dark:text-slate-400 hidden md:table-cell">
                      Haberler
                    </th>
                    <th className="px-4 py-3 text-sm font-medium text-muted-foreground dark:text-slate-400 text-right">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="border-b last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 dark:border-slate-800/50"
                    >
                      <td className="px-4 py-3">
                        <div
                          className="h-6 w-6 rounded-full"
                          style={{
                            background: category.color || '#6366f1',
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm dark:text-slate-100">{translateCategoryName(category.slug, category.name)}</p>
                        {category.description && (
                          <p className="text-xs text-muted-foreground dark:text-slate-400 truncate max-w-[300px]">
                            {translateCategoryDescription(category.slug, category.description)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <code className="text-xs bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-2 py-1 rounded">
                          {category.slug}
                        </code>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground dark:text-slate-400">
                          {category.article_count ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/categories/${category.id}/edit`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 dark:hover:bg-slate-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                            onClick={() => setDeleteId(String(category.id))}
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="dark:text-slate-100">Kategoriyi Sil</DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategorideki haberler silinmeyecek ancak kategorisiz kalacak.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)} className="dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300">
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Siliniyor...' : 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
