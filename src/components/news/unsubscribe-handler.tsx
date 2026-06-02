'use client';

import { useEffect, useState } from 'react';

export function UnsubscribeHandler() {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');
    const email = params.get('email');

    if (action === 'unsubscribe' && email) {
      setStatus('processing');
      setMessage('Aboneliğiniz iptal ediliyor...');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';

      fetch(`${apiUrl}/api/subscribe/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus('success');
            setMessage(data.data?.message || 'Aboneliğiniz başarıyla iptal edildi.');
          } else {
            setStatus('error');
            setMessage(data.error || 'Abonelik iptal edilemedi.');
          }
        })
        .catch(() => {
          setStatus('error');
          setMessage('Bir hata oluştu. Lütfen tekrar deneyin.');
        });
    }
  }, []);

  if (status === 'idle') return null;

  return (
    <div className={`p-4 rounded-xl text-sm text-center mb-6 ${
      status === 'processing'
        ? 'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
        : status === 'success'
          ? 'bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
          : 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
    }`}>
      {status === 'processing' && (
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {message}
        </div>
      )}
      {status === 'success' && (
        <div>
          <p className="font-medium">✅ {message}</p>
          <p className="mt-1 text-xs opacity-80">Artık bu e-posta adresine bildirim gönderilmeyecektir.</p>
        </div>
      )}
      {status === 'error' && (
        <p>❌ {message}</p>
      )}
    </div>
  );
}
