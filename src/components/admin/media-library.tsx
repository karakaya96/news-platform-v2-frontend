'use client';

import { Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatDateWithTime } from '@/lib/utils';

interface MediaFile {
  id: number;
  key: string;
  url: string;
  mimeType: string;
  size: number;
  alt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  files: MediaFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function MediaLibrary() {
  const t = useTranslations('admin');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [page]);

  async function fetchFiles() {
    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse>(`/api/user/media?page=${page}&limit=20`);
      if (res.success && res.data) {
        setFiles(res.data.files);
        setTotalPages(res.data.pagination.totalPages);
        setTotal(res.data.pagination.total);
      } else {
        setError(res.error || t('mediaLibrary.loadError'));
      }
    } catch {
      setError(t('mediaLibrary.loadError'));
    }
    setLoading(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError(t('mediaLibrary.fileTooLarge'));
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${api.getBaseUrl()}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(t('mediaLibrary.uploadSuccess'));
        fetchFiles();
      } else {
        setError(data.error || t('mediaLibrary.uploadError'));
      }
    } catch {
      setError(t('mediaLibrary.uploadError'));
    }
    setUploading(false);
    if (e.currentTarget) e.currentTarget.value = '';
  }

  async function handleDelete(key: string) {
    setDeleting((prev) => new Set(prev).add(Number(key)));
    try {
      const res = await fetch(`${api.getBaseUrl()}/api/user/media?key=${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(t('mediaLibrary.deleteSuccess'));
        fetchFiles();
      } else {
        setError(data.error || t('mediaLibrary.deleteError'));
      }
    } catch {
      setError(t('mediaLibrary.deleteError'));
    }
    setDeleting((prev) => {
      const next = new Set(prev);
      next.delete(Number(key));
      return next;
    });
  }

  async function handleBulkDelete() {
    if (selectedFiles.size === 0) return;

    const keys = Array.from(selectedFiles)
      .map((id) => {
        const file = files.find((f) => f.id === id);
        return file?.key;
      })
      .filter(Boolean);

    if (keys.length === 0) return;

    setShowDeleteConfirm(false);
    try {
      const res = await fetch(`${api.getBaseUrl()}/api/user/media/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        },
        body: JSON.stringify({ keys }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(t('mediaLibrary.bulkDeleteSuccess', { count: data.data.deletedCount }));
        setSelectedFiles(new Set());
        fetchFiles();
      } else {
        setError(data.error || t('mediaLibrary.deleteError'));
      }
    } catch {
      setError(t('mediaLibrary.deleteError'));
    }
  }

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  }

  function isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  if (loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-indigo-500" />
            {t('mediaLibrary.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>Skeleton placeholders are identical, index is acceptable</explanation>
              <Skeleton key={`skeleton-${i}`} className="aspect-square rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-indigo-500" />
          {t('mediaLibrary.title')}
        </CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {t('mediaLibrary.totalFiles', { total })}
          </span>
          <label className="cursor-pointer">
            <Upload className="h-5 w-5 text-indigo-600 hover:text-indigo-700" />
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </CardHeader>

      {success && (
        <div className="mx-4 mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
        </div>
      )}
      {error && (
        <div className="mx-4 mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <CardContent className="pt-0">
        {selectedFiles.size > 0 && (
          <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
              {t('mediaLibrary.selectedFiles', { count: selectedFiles.size })}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedFiles(new Set())}>
                {t('mediaLibrary.cancel')}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-1" />
                {t('mediaLibrary.deleteSelected')}
              </Button>
            </div>
          </div>
        )}

        <ScrollArea className="h-[500px]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                className={`relative aspect-square rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 transition-all ${
                  selectedFiles.has(file.id)
                    ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                    : ''
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  {isImage(file.mimeType) ? (
                    // biome-ignore lint/performance/noImgElement: <explanation>Images served via R2 proxy, already optimized</explanation>
                    <img
                      src={file.url}
                      alt={file.alt || ''}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-slate-400" />
                  )}
                </div>

                <div className="absolute top-1 right-1 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (selectedFiles.has(file.id)) {
                        setSelectedFiles((prev) => {
                          const next = new Set(prev);
                          next.delete(file.id);
                          return next;
                        });
                      } else {
                        setSelectedFiles((prev) => new Set(prev).add(file.id));
                      }
                    }}
                    className={`p-1.5 rounded-full transition-colors ${
                      selectedFiles.has(file.id)
                        ? 'bg-indigo-500 text-white'
                        : 'bg-white/80 dark:bg-slate-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/50'
                    }`}
                    title={
                      selectedFiles.has(file.id)
                        ? t('mediaLibrary.deselect')
                        : t('mediaLibrary.select')
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/60 text-white text-xs">
                  <div className="truncate font-medium">
                    {file.alt || file.key.split('/').pop() || 'Unknown'}
                  </div>
                  <div className="flex items-center justify-between mt-1 opacity-80">
                    <span>{formatBytes(file.size)}</span>
                    <span>{formatDateWithTime(file.createdAt, 'tr')}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(file.key);
                  }}
                  disabled={deleting.has(file.id)}
                  className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
                  title={t('mediaLibrary.delete')}
                >
                  <div className="absolute top-1 right-1 p-1.5 bg-red-500/90 text-white rounded-full">
                    <Trash2 className="h-4 w-4" />
                  </div>
                </button>

                {deleting.has(file.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t('mediaLibrary.previous')}
            </Button>
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {t('mediaLibrary.pageInfo', { current: page, total: totalPages })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {t('mediaLibrary.next')}
            </Button>
          </div>
        )}

        {files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              {t('mediaLibrary.emptyTitle')}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">{t('mediaLibrary.emptyDesc')}</p>
            <label className="cursor-pointer">
              <Upload className="h-5 w-5 text-indigo-600 mr-2" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
              <Button>{t('mediaLibrary.uploadFirst')}</Button>
            </label>
          </div>
        )}
      </CardContent>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2">{t('mediaLibrary.confirmDelete')}</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              {t('mediaLibrary.confirmDeleteDesc', { count: selectedFiles.size })}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                {t('mediaLibrary.cancel')}
              </Button>
              <Button variant="destructive" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                {t('mediaLibrary.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
