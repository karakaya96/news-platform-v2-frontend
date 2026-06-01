'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
  CheckCircle2,
  XCircle,
  Trash2,
  MessageCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Mail,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import type { CommentItem } from '@/types';

const commentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  rejected: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  spam: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

const commentStatusLabels: Record<string, string> = {
  pending: 'Beklemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
  spam: 'Spam',
};

const commentStatusDots: Record<string, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  spam: 'bg-slate-400',
};

export default function CommentsPage() {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [replyId, setReplyId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);

  const [bulkIds, setBulkIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await api.get<CommentItem[]>(`/api/comments/admin/all?${params.toString()}`);
      if (res.success && res.data) {
        setComments(Array.isArray(res.data) ? res.data : []);
        setTotalPages(res.pagination?.totalPages || 1);
        setTotal(res.pagination?.total || 0);
      } else {
        toast.error('Yorumlar yüklenemedi');
      }
    } catch {
      toast.error('Yorumlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await api.put(`/api/comments/admin/${id}/status`, { status: newStatus });
      if (res.success) {
        toast.success(`Yorum ${commentStatusLabels[newStatus].toLowerCase()}`);
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus as CommentItem['status'] } : c))
        );
      } else {
        toast.error('Durum güncellenemedi');
      }
    } catch {
      toast.error('Durum güncellenemedi');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/api/comments/admin/${deleteId}`);
      if (res.success) {
        toast.success('Yorum silindi');
        setComments((prev) => prev.filter((c) => c.id !== deleteId));
        setTotal((prev) => prev - 1);
      } else {
        toast.error('Silme başarısız');
      }
    } catch {
      toast.error('Yorum silinemedi');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleReply = async () => {
    if (!replyId || !replyContent.trim()) return;
    setReplying(true);
    try {
      const res = await api.post(`/api/comments/admin/${replyId}/reply`, { content: replyContent.trim() });
      if (res.success) {
        toast.success('Yanıt gönderildi');
        setReplyId(null);
        setReplyContent('');
        fetchComments();
      } else {
        toast.error('Yanıt gönderilemedi');
      }
    } catch {
      toast.error('Yanıt gönderilemedi');
    } finally {
      setReplying(false);
    }
  };

  const handleBulkAction = async () => {
    if (bulkIds.length === 0 || !bulkAction) return;
    try {
      const res = await api.put('/api/comments/admin/bulk/status', { ids: bulkIds, status: bulkAction });
      if (res.success) {
        toast.success(`${bulkIds.length} yorum güncellendi`);
        setBulkIds([]);
        setBulkAction('');
        fetchComments();
      } else {
        toast.error('Toplu işlem başarısız');
      }
    } catch {
      toast.error('Toplu işlem başarısız');
    }
  };

  const toggleBulkId = (id: number) => {
    setBulkIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Yorumlar</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{total} toplam yorum</p>
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <SelectValue placeholder="Tüm Durumlar" />
          </SelectTrigger>
          <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="pending">Beklemede</SelectItem>
            <SelectItem value="approved">Onaylandı</SelectItem>
            <SelectItem value="rejected">Reddedildi</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>

        {bulkIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">{bulkIds.length} seçili</span>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-[160px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder="Toplu işlem" />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="approved">Onayla</SelectItem>
                <SelectItem value="rejected">Reddet</SelectItem>
                <SelectItem value="spam">Spam İşaretle</SelectItem>
                <SelectItem value="pending">Beklemeye Al</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Uygula
            </Button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <Card className="border-0 shadow-md rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Yorum bulunamadı</p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Henüz bu habere yorum yapılmamış</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                    comment.parent_id ? 'pl-12 border-l-2 border-indigo-200 dark:border-indigo-800 ml-6' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={bulkIds.includes(comment.id)}
                      onChange={() => toggleBulkId(comment.id)}
                      className="mt-1.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {comment.author_name}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {comment.author_email}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(comment.created_at)}
                        </span>
                        <Badge
                          variant="outline"
                          className={`${commentStatusColors[comment.status]} text-xs font-medium rounded-full px-2 py-0.5`}
                        >
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${commentStatusDots[comment.status]}`} />
                          {commentStatusLabels[comment.status]}
                        </Badge>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2 whitespace-pre-wrap">
                        {comment.content}
                      </p>

                      {/* News reference */}
                      {comment.news_title && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
                          <ExternalLink className="h-3 w-3" />
                          <Link
                            href={`/news/${comment.news_slug}`}
                            target="_blank"
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate max-w-[300px]"
                          >
                            {comment.news_title}
                          </Link>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {comment.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950 rounded-lg"
                            onClick={() => handleStatusChange(comment.id, 'approved')}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Onayla
                          </Button>
                        )}
                        {comment.status !== 'rejected' && comment.status !== 'spam' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 rounded-lg"
                            onClick={() => handleStatusChange(comment.id, 'rejected')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reddet
                          </Button>
                        )}
                        {comment.status !== 'spam' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg"
                            onClick={() => handleStatusChange(comment.id, 'spam')}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Spam
                          </Button>
                        )}
                        {!comment.parent_id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950 rounded-lg"
                            onClick={() => setReplyId(comment.id)}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            Yanıtla
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950 rounded-lg"
                          onClick={() => setDeleteId(comment.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
            <DialogTitle className="text-lg dark:text-slate-100">Yorumu Sil</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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

      {/* Reply Dialog */}
      <Dialog open={!!replyId} onOpenChange={() => { setReplyId(null); setReplyContent(''); }}>
        <DialogContent className="rounded-2xl dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-lg dark:text-slate-100">Yorumu Yanıtla</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              Bu yorumu yönetici olarak yanıtlayın. Yanıt otomatik olarak onaylanır.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Yanıtınızı yazın..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={4}
            className="rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => { setReplyId(null); setReplyContent(''); }} className="dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300">
              İptal
            </Button>
            <Button
              onClick={handleReply}
              disabled={replying || !replyContent.trim()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {replying ? 'Gönderiliyor...' : 'Yanıtla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
