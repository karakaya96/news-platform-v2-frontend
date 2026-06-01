'use client';

import { useState } from 'react';
import { CommentItem } from '@/types';

interface Comment {
  id: number;
  news_id: number;
  parent_id: number | null;
  author_name: string;
  content: string;
  created_at: string;
  reply_count?: number;
}

interface CommentsSectionProps {
  newsId: number;
  initialComments: CommentItem[];
  initialCount: number;
}

export function CommentsSection({ newsId, initialComments, initialCount }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [count, setCount] = useState(initialCount);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [parentId, setParentId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!authorName.trim()) {
      setError('İsim gerekli');
      return;
    }
    if (!authorEmail.trim() || !authorEmail.includes('@')) {
      setError('Geçerli bir e-posta adresi girin');
      return;
    }
    if (!content.trim()) {
      setError('Yorum içeriği gerekli');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev'}/api/comments/${newsId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            author_name: authorName.trim(),
            author_email: authorEmail.trim(),
            content: content.trim(),
            parent_id: parentId,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess('Yorumunuz gönderildi ve onay bekliyor.');
        setContent('');
        setParentId(null);
        setReplyingTo(null);
      } else {
        setError(data.error || 'Yorum gönderilemedi');
      }
    } catch {
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: number, authorName: string) => {
    setParentId(commentId);
    setReplyingTo(commentId);
    setContent(`@${authorName} `);
    window.scrollTo({ top: document.getElementById('comment-form')?.offsetTop ?? 0, behavior: 'smooth' });
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const buildNestedComments = (comments: Comment[]): Comment[] => {
    const topLevel = comments.filter((c) => !c.parent_id);
    const replies = comments.filter((c) => c.parent_id);
    
    return topLevel.map((c) => ({
      ...c,
      replies: replies.filter((r) => r.parent_id === c.id),
    }));
  };

  const nestedComments = buildNestedComments(comments);

  return (
    <section className="max-w-4xl mx-auto mt-12" id="comments">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Yorumlar</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{count} yorum</p>
        </div>
      </div>

      {/* Comment Form */}
      <form
        id="comment-form"
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 mb-8 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          {replyingTo ? 'Yorumu Yanıtla' : 'Yorum Yap'}
        </h3>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="authorName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Adınız <span className="text-red-500">*</span>
            </label>
            <input
              id="authorName"
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="Adınızı girin"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="authorEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              E-posta <span className="text-red-500">*</span>
            </label>
            <input
              id="authorEmail"
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              placeholder="ornek@email.com"
              maxLength={255}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Yorumunuz <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Düşüncelerinizi paylaşın..."
            rows={4}
            maxLength={5000}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">{content.length}/5000</p>
        </div>

        <div className="flex items-center justify-between">
          {replyingTo && (
            <button
              type="button"
              onClick={() => {
                setReplyingTo(null);
                setParentId(null);
                setContent('');
              }}
              className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Yanıtı iptal et
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="ml-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-500/25 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Gönderiliyor...' : 'Yorum Gönder'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      {nestedComments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Henüz yorum yapılmamış</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">İlk yorumu siz yapın!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {nestedComments.map((comment) => (
            <div key={comment.id} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white font-bold text-sm">
                  {comment.author_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                  <button
                    onClick={() => handleReply(comment.id, comment.author_name)}
                    className="mt-2 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
                  >
                    Yanıtla
                  </button>
                </div>
              </div>

              {/* Nested Replies */}
              {'replies' in comment && (comment as any).replies?.length > 0 && (
                <div className="ml-8 mt-4 pl-4 border-l-2 border-indigo-100 dark:border-indigo-900 space-y-4">
                  {(comment as any).replies.map((reply: Comment) => (
                    <div key={reply.id} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                        {reply.author_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            {reply.author_name}
                          </span>
                          <span className="text-xs text-slate-400">
                            {formatDate(reply.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
