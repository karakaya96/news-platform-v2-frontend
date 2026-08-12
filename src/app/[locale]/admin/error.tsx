'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="rounded-2xl border bg-card p-8 shadow-lg max-w-md">
        <div className="mb-4 text-5xl"></div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Bir hata oluştu
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Admin panelinde beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 font-mono">
            Hata kodu: {error.digest}
          </p>
        )}
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">
            Tekrar Dene
          </Button>
          <Button onClick={() => (window.location.href = '/admin/dashboard')}>
            Dashboard'a Dön
          </Button>
        </div>
      </div>
    </div>
  );
}
