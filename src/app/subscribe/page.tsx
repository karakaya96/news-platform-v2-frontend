export const runtime = 'edge';

import type { Metadata } from 'next';
import { SubscriptionForm } from '@/components/news/subscription-form';
import { UnsubscribeHandler } from '@/components/news/unsubscribe-handler';
import { CATEGORY_TRANSLATIONS } from '@/lib/constants';
import { getPublicSettings, getSiteName } from '@/lib/settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const siteName = getSiteName(settings);
  return {
    title: `Bildirim Aboneliği — ${siteName}`,
    description:
      'Yeni haberlerden anında haberdar olun. Tarayıcı bildirimi veya e-posta ile abone olun.',
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { cache: 'no-store' });
    if (!res.ok) return Object.entries(CATEGORY_TRANSLATIONS).map(([slug, t]) => ({ slug, name: t.name, description: t.description }));
    const data = await res.json();
    return data.data || [];
  } catch {
    return Object.entries(CATEGORY_TRANSLATIONS).map(([slug, t]) => ({
      slug,
      name: t.name,
      description: t.description,
    }));
  }
}

async function getPublicSettings() {
  try {
    const res = await fetch(`${API_URL}/api/settings/public/all`, { cache: 'no-store' });
    if (!res.ok) return { notifications_enabled: 'true', notifications_email_enabled: 'true' };
    const data = await res.json();
    return data.data || { notifications_enabled: 'true', notifications_email_enabled: 'true' };
  } catch {
    return { notifications_enabled: 'true', notifications_email_enabled: 'true' };
  }
}

export default async function SubscribePage() {
  const [categories, settings] = await Promise.all([getCategories(), getPublicSettings()]);

  const notificationsEnabled = settings.notifications_enabled !== 'false';
  const emailEnabled = settings.notifications_email_enabled !== 'false';

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 font-serif">Bildirim Aboneliği</h1>
        <p className="text-lg text-muted-foreground">Yeni haberlerden anında haberdar olun</p>
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
            Bildirimler devre dışıdır
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
            Yönetici tarafından bildirimler kapatılmıştır. Daha sonra tekrar deneyin.
          </p>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Abonelikten çıkmak istediğinizde, e-posta bildirimlerindeki &quot;Aboneliği İptal Et&quot;
          linkini kullanabilirsiniz.
        </p>
      </div>
    </div>
  );
}
