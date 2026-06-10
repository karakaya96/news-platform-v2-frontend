export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL, SITE_LOGO_URL } from '@/lib/constants';
import SearchContent from './search-content';

export const metadata: Metadata = {
  title: `Haber Ara | ${SITE_NAME}`,
  description: 'Haberler içinde arama yapın. Anahtar kelime, kategori ve tarihe göre filtreleyin.',
  openGraph: {
    title: `Haber Ara | ${SITE_NAME}`,
    description: 'Haberler içinde arama yapın. Anahtar kelime, kategori ve tarihe göre filtreleyin.',
    type: 'website',
    url: `${SITE_URL}/search`,
    siteName: SITE_NAME,
    images: [{ url: SITE_LOGO_URL, width: 512, height: 512, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Haber Ara | ${SITE_NAME}`,
    description: 'Haberler içinde arama yapın.',
    images: [SITE_LOGO_URL],
  },
  alternates: {
    canonical: `${SITE_URL}/search`,
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function SearchPage() {
  return <SearchContent />;
}
