export const revalidate = 60;

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { getPublicSettings, getSiteName, getSiteUrl, getLogoUrl } from '@/lib/settings';
import SearchContent from './search-content';

interface SearchPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'search' });
  const settings = await getPublicSettings();
  const siteName = getSiteName(settings);
  const siteUrl = getSiteUrl(settings);
  const logoUrl = getLogoUrl(settings);

  return {
    title: `${t('title')} | ${siteName}`,
    description: t('description'),
    openGraph: {
      title: `${t('title')} | ${siteName}`,
      description: t('description'),
      type: 'website',
      url: `${siteUrl}/search`,
      siteName,
      images: [{ url: logoUrl, width: 512, height: 512, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t('title')} | ${siteName}`,
      description: t('description'),
      images: [logoUrl],
    },
    alternates: {
      canonical: `${siteUrl}/search`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function SearchPage() {
  return <SearchContent />;
}
