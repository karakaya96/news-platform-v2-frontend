export const runtime = 'edge';

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { SubscriptionForm } from '@/components/news/subscription-form';
import { UnsubscribeHandler } from '@/components/news/unsubscribe-handler';
import { CATEGORY_TRANSLATIONS } from '@/lib/constants';
import { getPublicSettings, getSiteName } from '@/lib/settings';

interface SubscribePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: SubscribePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'subscribe' });
  const settings = await getPublicSettings();
  const siteName = getSiteName(settings);
  return {
    title: `${t('title')} — ${siteName}`,
    description: t('description'),
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';

async function getCategories(locale: string) {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { cache: 'no-store' });
    if (!res.ok) {
      return Object.entries(CATEGORY_TRANSLATIONS).map(([slug, info]) => ({
        slug,
        name: locale === 'en' ? info.nameEn : info.name,
        description: locale === 'en' ? info.descriptionEn : info.description,
        color: '#6366f1',
      }));
    }
    const data = await res.json();
    return data.data || [];
  } catch {
    return Object.entries(CATEGORY_TRANSLATIONS).map(([slug, info]) => ({
      slug,
      name: locale === 'en' ? info.nameEn : info.name,
      description: locale === 'en' ? info.descriptionEn : info.description,
      color: '#6366f1',
    }));
  }
}

export default async function SubscribePage({ params }: SubscribePageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'subscribe' });
  const [categories, settings] = await Promise.all([getCategories(locale), getPublicSettings()]);

  const notificationsEnabled = settings.notifications_enabled !== 'false';
  const emailEnabled = settings.notifications_email_enabled !== 'false';

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 font-serif">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('description')}</p>
      </div>

      <UnsubscribeHandler />

      {notificationsEnabled ? (
        <SubscriptionForm
          categories={categories.map((c: { slug: string; name: string; color?: string }) => ({
            slug: c.slug,
            name: c.name,
            color: c.color || '#6366f1',
          }))}
          showBrowserPush={true}
          showEmail={emailEnabled}
        />
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
            {t('disabled')}
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
            {t('disabledDetail')}
          </p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          {t('unsubscribeInfo')}
        </p>
      </div>
    </div>
  );
}
