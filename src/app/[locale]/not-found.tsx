import { FileQuestion, Home, Newspaper } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { getPublicSettings, getSiteName } from '@/lib/settings';

export default async function NotFound() {
  const t = await getTranslations('notFound');
  const settings = await getPublicSettings();
  const siteName = getSiteName(settings);

  return (
    <div className="container mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/50">
        <FileQuestion className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
      </div>

      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
        404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
        {t('title')}
      </h1>
      <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
        {t('description', { siteName })}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            {t('backHome')}
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="rounded-xl border-slate-200 dark:border-slate-700"
        >
          <Link href="/categories">
            <Newspaper className="mr-2 h-4 w-4" />
            {t('browseNews')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
