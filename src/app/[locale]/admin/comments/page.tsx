'use client';

export const dynamic = 'force-dynamic';

import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  MessageCircle,
  Newspaper,
  Trash2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { formatDateWithTime } from '@/lib/utils';
import type { CommentItem } from '@/types';

const commentStatusColors: Record<string, string> = {
  pending:
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
  approved:
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
  rejected:
    'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
  spam: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
};

const commentStatusDots: Record<string, string> = {
  pending: 'bg-amber-500',
  approved: 'bg-emerald-500',
  rejected: 'bg-red-500',
  spam: 'bg-slate-400',
};

const avatarGradients = [
  'bg-gradient-to-br from-indigo-400 to-violet-500',
  'bg-gradient-to-br from-emerald-400 to-teal-500',
  'bg-gradient-to-br from-rose-400 to-pink-500',
  'bg-gradient-to-br from-amber-400 to-orange-500',
  'bg-gradient-to-br from-sky-400 to-blue-500',
];

export default function CommentsPage() {
  const t = useTranslations('admin.commentsPage');
  const locale = useLocale();
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
        toast.error(t('loadError'));
      }
    } catch {
      toast.error(t('loadError'));
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
        toast.success(t('statusUpdated', { status: t(`status.${newStatus}`) }));
        setComments((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus as CommentItem['status'] } : c))
        );
      } else {
        toast.error(t('statusUpdateFailed'));
      }
    } catch {
      toast.error(t('statusUpdateFailed'));
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/api/comments/admin/${deleteId}`);
      if (res.success) {
        toast.success(t('deleted'));
        setComments((prev) => prev.filter((c) => c.id !== deleteId));
        setTotal((prev) => prev - 1);
      } else {
        toast.error(t('deleteFailed'));
      }
    } catch {
      toast.error(t('deleteError'));
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleReply = async () => {
    if (!replyId || !replyContent.trim()) return;
    setReplying(true);
    try {
      const res = await api.post(`/api/comments/admin/${replyId}/reply`, {
        content: replyContent.trim(),
      });
      if (res.success) {
        toast.success(t('replySent'));
        setReplyId(null);
        setReplyContent('');
        fetchComments();
      } else {
        toast.error(t('replyFailed'));
      }
    } catch {
      toast.error(t('replyFailed'));
    } finally {
      setReplying(false);
    }
  };

  const handleBulkAction = async () => {
    if (bulkIds.length === 0 || !bulkAction) return;
    try {
      const res = await api.put('/api/comments/admin/bulk/status', {
        ids: bulkIds,
        status: bulkAction,
      });
      if (res.success) {
        toast.success(t('bulkUpdated', { count: bulkIds.length }));
        setBulkIds([]);
        setBulkAction('');
        fetchComments();
      } else {
        toast.error(t('bulkFailed'));
      }
    } catch {
      toast.error(t('bulkFailed'));
    }
  };

  const toggleBulkId = (id: number) => {
    setBulkIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} {t('count')}
          </p>
        </div>
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <SelectValue placeholder={t('allStatus')} />
          </SelectTrigger>
          <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="pending">{t('status.pending')}</SelectItem>
            <SelectItem value="approved">{t('status.approved')}</SelectItem>
            <SelectItem value="rejected">{t('status.rejected')}</SelectItem>
            <SelectItem value="spam">{t('status.spam')}</SelectItem>
          </SelectContent>
        </Select>

        {bulkIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl p-3 sm:p-0 sm:bg-transparent sm:dark:bg-transparent w-full sm:w-auto">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">
              {bulkIds.length} {t('selected')}
            </span>
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="flex-1 min-w-[130px] sm:w-[160px] rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <SelectValue placeholder={t('bulkPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="rounded-xl dark:bg-slate-800 dark:border-slate-700">
                <SelectItem value="approved">{t('bulkApprove')}</SelectItem>
                <SelectItem value="rejected">{t('bulkReject')}</SelectItem>
                <SelectItem value="spam">{t('bulkSpam')}</SelectItem>
                <SelectItem value="pending">{t('bulkPending')}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {t('applyButton')}
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
                <Skeleton key={`skeleton-comment-${i}`} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
                {t('noComments')}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                {t('noCommentsDetail')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className={`px-4 py-4 sm:p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                    comment.parentId
                      ? 'border-l-2 border-indigo-200 dark:border-indigo-800 ml-3 sm:ml-6 sm:pl-12'
                      : ''
                  }`}
                >
                  <div className="flex items-start gap-2.5 sm:gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={bulkIds.includes(comment.id)}
                      onChange={() => toggleBulkId(comment.id)}
                      className="mt-1.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-indigo-600 focus:ring-indigo-500"
                    />

                    {/* Avatar */}
                    <div
                      className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarGradients[comment.id % avatarGradients.length]}`}
                    >
                      {(comment.authorName || '?').charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Author row */}
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-1.5">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                              {comment.authorName || t('anonymous')}
                            </span>
                            <Badge
                              variant="outline"
                              className={`${commentStatusColors[comment.status]} text-xs font-medium rounded-full px-2 py-0.5`}
                            >
                              <span
                                className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${commentStatusDots[comment.status]}`}
                              />
                              {t(`status.${comment.status}`)}
                            </Badge>
                            {comment.parentId && (
                              <Badge
                                variant="outline"
                                className="text-xs font-medium rounded-full px-2 py-0.5 bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-400 dark:border-indigo-800"
                              >
                                {t('isReply')}
                              </Badge>
                            )}
                          </div>
                          {/* Meta row: email · date · IP */}
                          <div className="flex items-center gap-x-2 gap-y-1 flex-wrap mt-1 text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
                            {comment.authorEmail && (
                              <a
                                href={`mailto:${comment.authorEmail}`}
                                className="flex items-center gap-1 max-w-full truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                              >
                                <Mail className="h-3 w-3 shrink-0" />
                                <span className="truncate">{comment.authorEmail}</span>
                              </a>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDateWithTime(comment.createdAt, locale)}
                            </span>
                            {comment.ipAddress && (
                              <span className="hidden sm:flex items-center gap-1 font-mono">
                                <Globe className="h-3 w-3" />
                                {comment.ipAddress}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 whitespace-pre-wrap leading-relaxed bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/50">
                        {comment.content}
                      </p>

                      {/* News reference card */}
                      {comment.newsTitle && (
                        <Link
                          href={`/news/${comment.newsSlug}`}
                          target="_blank"
                          className="flex items-center gap-2 w-fit max-w-full mb-3 px-3 py-2 sm:py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900 text-xs font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950 transition-colors"
                        >
                          <Newspaper className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{comment.newsTitle}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0 opacity-60" />
                        </Link>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap -mx-1">
                        {comment.status !== 'approved' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 sm:h-7 px-2.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950 rounded-lg"
                            onClick={() => handleStatusChange(comment.id, 'approved')}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {t('approveButton')}
                          </Button>
                        )}
                        {comment.status !== 'rejected' && comment.status !== 'spam' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 sm:h-7 px-2.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 rounded-lg"
                            onClick={() => handleStatusChange(comment.id, 'rejected')}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            {t('rejectButton')}
                          </Button>
                        )}
                        {comment.status !== 'spam' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 sm:h-7 px-2.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg"
                            onClick={() => handleStatusChange(comment.id, 'spam')}
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {t('spamButton')}
                          </Button>
                        )}
                        {!comment.parentId && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 sm:h-7 px-2.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950 rounded-lg"
                            onClick={() => setReplyId(comment.id)}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {t('replyButton')}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 sm:h-7 px-2.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950 rounded-lg"
                          onClick={() => setDeleteId(comment.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {t('deleteButton')}
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
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {t('page')}{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{page}</span> /{' '}
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
              {t('previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              {t('next')}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="rounded-2xl max-w-[calc(100vw-2rem)] sm:max-w-lg dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-lg dark:text-slate-100">
              {t('deleteDialog.title')}
            </DialogTitle>
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

      {/* Reply Dialog */}
      <Dialog
        open={!!replyId}
        onOpenChange={() => {
          setReplyId(null);
          setReplyContent('');
        }}
      >
        <DialogContent className="rounded-2xl max-w-[calc(100vw-2rem)] sm:max-w-lg dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-lg dark:text-slate-100">
              {t('replyDialog.title')}
            </DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400">
              {t('replyDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={t('replyDialog.placeholder')}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={4}
            className="rounded-xl border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setReplyId(null);
                setReplyContent('');
              }}
              className="dark:border-slate-700 dark:hover:bg-slate-800 dark:text-slate-300"
            >
              {t('replyDialog.cancel')}
            </Button>
            <Button
              onClick={handleReply}
              disabled={replying || !replyContent.trim()}
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {replying ? t('replyDialog.sending') : t('replyDialog.reply')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
