import type { Metadata } from 'next';
import Script from 'next/script';
import { VercelAnalytics } from '@/components/analytics/vercel-analytics';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { GOOGLE_SITE_VERIFICATION, NAVIGATION } from '@/lib/constants';
import { getPublicSettings, getSiteName, getSiteUrl, getLogoUrl, getSiteDescription, getSocialLinks } from '@/lib/settings';
import { inter } from '@/lib/fonts';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const siteName = getSiteName(settings);
  const siteUrl = getSiteUrl(settings);
  const siteDescription = getSiteDescription(settings);
  const logoUrl = getLogoUrl(settings);
  const socialLinks = getSocialLinks(settings);
  const seoKeywords = settings.seo_keywords || 'haber, son dakika, güncel haberler, Türkiye haberleri, dünya haberleri';

  const title = settings.seo_title || `${siteName} - Güvenilir Haber Kaynağınız`;

  const ogImages = settings.seo_og_image
    ? [{ url: settings.seo_og_image, width: 1200, height: 630, alt: siteName }]
    : [{ url: logoUrl, width: 512, height: 512, alt: siteName, type: 'image/png' as const }];

  return {
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description: settings.seo_description || siteDescription,
    keywords: seoKeywords.split(',').map((k) => k.trim()),
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    publisher: siteName,
    applicationName: siteName,
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
      siteName,
      title: {
        default: title,
        template: `%s | ${siteName}`,
      },
      description: settings.seo_description || siteDescription,
      url: siteUrl,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      site: socialLinks.twitter ? `@${socialLinks.twitter.split('/').pop()}` : undefined,
      creator: socialLinks.twitter ? `@${socialLinks.twitter.split('/').pop()}` : undefined,
      title,
      description: settings.seo_description || siteDescription,
      images: [settings.seo_og_image || logoUrl],
    },
    alternates: {
      canonical: siteUrl,
      languages: {
        [settings.site_language || 'tr']: siteUrl,
      },
    },
    icons: {
      icon: getFaviconUrl(settings),
      apple: getFaviconUrl(settings),
    },
    metadataBase: new URL(siteUrl),
    verification: {
      google: GOOGLE_SITE_VERIFICATION,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicSettings();
  const siteName = getSiteName(settings);
  const siteUrl = getSiteUrl(settings);
  const siteDescription = getSiteDescription(settings);
  const logoUrl = getLogoUrl(settings);
  const socialLinks = getSocialLinks(settings);

  const sameAs = Object.values(socialLinks).filter(Boolean);

  return (
    <html lang={settings.site_language || 'tr'} suppressHydrationWarning>
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vitals.vercel-insights.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https:; media-src 'self' https:; connect-src 'self' https://news-v2-api.karakaya-mk96.workers.dev https://vitals.vercel-insights.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://www.dailymotion.com https://player.vimeo.com https://www.bloomberg.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content;"
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
              name: siteName,
              url: siteUrl,
              logo: {
                '@type': 'ImageObject',
                url: logoUrl,
                width: 512,
                height: 512,
              },
              sameAs: sameAs.length > 0 ? sameAs : undefined,
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                email: settings.email_from_address || 'newshaberglobal@gmail.com',
                url: `${siteUrl}/contact`,
              },
              description: siteDescription,
              foundingDate: '2025',
              publishingPrinciples: `${siteUrl}/editorial`,
            }),
          }}
        />
        <ThemeProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header settings={settings} navigation={NAVIGATION} />
            <main className="flex-1">{children}</main>
            <Footer settings={settings} navigation={NAVIGATION} />
            <VercelAnalytics />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
