import type { Metadata } from 'next';
import Script from 'next/script';
import { VercelAnalytics } from '@/components/analytics/vercel-analytics';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/providers/theme-provider';
import {
  GOOGLE_SITE_VERIFICATION,
  SITE_DESCRIPTION,
  SITE_LOGO_URL,
  SITE_NAME,
  SITE_URL,
} from '@/lib/constants';
import { inter } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Güvenilir Haber Kaynağınız`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'haber',
    'son dakika',
    'güncel haberler',
    'Türkiye haberleri',
    'dünya haberleri',
    'ekonomi',
    'siyaset',
    'spor',
    'teknoloji',
    'sağlık',
    'kültür',
    'analiz',
    'haberler',
    'gündem',
    'news',
    'breaking news',
    'Turkey news',
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    alternateLocale: ['en_US'],
    siteName: SITE_NAME,
    title: {
      default: `${SITE_NAME} - Güvenilir Haber Kaynağınız`,
      template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: SITE_LOGO_URL,
        width: 512,
        height: 512,
        alt: SITE_NAME,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@newshaberglobal',
    creator: '@newshaberglobal',
    title: `${SITE_NAME} - Güvenilir Haber Kaynağınız`,
    description: SITE_DESCRIPTION,
    images: [SITE_LOGO_URL],
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      tr: SITE_URL,
    },
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  metadataBase: new URL(SITE_URL),
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vitals.vercel-insights.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; media-src 'self' https:; connect-src 'self' https://news-v2-api.karakaya-mk96.workers.dev https://vitals.vercel-insights.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.dailymotion.com https://player.vimeo.com https://www.bloomberg.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;"
        />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta
          httpEquiv="Permissions-Policy"
          content="camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
        />
        <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin" />
        <meta httpEquiv="Cross-Origin-Resource-Policy" content="same-origin" />
        <meta httpEquiv="Cross-Origin-Embedder-Policy" content="require-corp" />
      </head>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased`}>
        <Script
          id="organization-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsMediaOrganization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: {
                '@type': 'ImageObject',
                url: SITE_LOGO_URL,
                width: 512,
                height: 512,
              },
              sameAs: [
                'https://twitter.com/newshaberglobal',
                'https://facebook.com/newshaberglobal',
                'https://linkedin.com/company/newshaberglobal',
                'https://youtube.com/@newshaberglobal',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                email: 'newshaberglobal@gmail.com',
                url: `${SITE_URL}/contact`,
              },
              description: SITE_DESCRIPTION,
              foundingDate: '2025',
              publishingPrinciples: `${SITE_URL}/editorial`,
            }),
          }}
        />
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <VercelAnalytics />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
