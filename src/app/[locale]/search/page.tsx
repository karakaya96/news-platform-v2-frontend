export const revalidate = 60;

import type { Metadata } from 'next';
import { getPublicSettings, getSiteName, getSiteUrl, getLogoUrl } from '@/lib/settings';
import SearchContent from './search-content';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const siteName = getSiteName(settings);
  const siteUrl = getSiteUrl(settings);
  const logoUrl = getLogoUrl(settings);

  return {
    title: `Haber Ara | ${siteName}`,
    description: 'Haberler içinde arama yapın. Anahtar kelime, kategori ve tarihe göre filtreleyin.',
    openGraph: {
      title: `Haber Ara | ${siteName}`,
      description: 'Haberler içinde arama yapın. Anahtar kelime, kategori ve tarihe göre filtreleyin.',
      type: 'website',
      url: `${siteUrl}/search`,
      siteName,
      images: [{ url: logoUrl, width: 512, height: 512, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Haber Ara | ${siteName}`,
      description: 'Haberler içinde arama yapın.',
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
