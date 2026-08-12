'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <button
      onClick={() => switchLocale(locale === 'tr' ? 'en' : 'tr')}
      className="px-2 py-1 text-xs font-medium rounded-md bg-muted hover:bg-muted/80 transition-colors"
      aria-label={locale === 'tr' ? 'Switch to English' : "Türkçe'ye geç"}
    >
      {locale === 'tr' ? 'EN' : 'TR'}
    </button>
  );
}
