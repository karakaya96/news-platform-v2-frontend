export const runtime = 'edge';

import type { Metadata } from 'next';
import api from '@/lib/api';
import { SubscriptionForm } from '@/components/news/subscription-form';
import { CATEGORY_TRANSLATIONS, SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: `Bildirim Aboneliği — ${SITE_NAME}`,
  description: 'Yeni haberlerden anında haberdar olun. Tarayıcı bildirimi veya e-posta ile abone olun.',
};

async function getCategories() {
  try {
    const res = await api.get<any[]>('/api/categories');
    return res.data || [];
  } catch {
    return Object.entries(CATEGORY_TRANSLATIONS).map(([slug, t]) => ({
      slug,
      name: t.name,
      description: t.description,
    }));
  }
}

export default async function SubscribePage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 font-serif">
          Bildirim Aboneliği
        </h1>
        <p className="text-lg text-muted-foreground">
          Yeni haberlerden anında haberdar olun
        </p>
      </div>

      <SubscriptionForm
        categories={categories.map((c: any) => ({
          slug: c.slug,
          name: c.name,
          color: c.color || '#6366f1',
        }))}
      />

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Abonelikten çıkmak istediğinizde, e-posta bildirimlerindeki
          &quot;Aboneliği İptal Et&quot; linkini kullanabilirsiniz.
        </p>
      </div>
    </div>
  );
}
