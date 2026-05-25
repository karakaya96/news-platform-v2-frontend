import type { Metadata } from 'next';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ThemeProvider } from '@/components/providers/theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NewsPlatform - Güvenilir Haber Kaynağınız',
    template: '%s | NewsPlatform',
  },
  description: 'Son dakika haberleri, analizler ve derinlemesine raporlama için güvenilir kaynağınız.',
  keywords: ['haber', 'son dakika', 'analiz', 'haberler'],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'NewsPlatform',
  },
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='tr' suppressHydrationWarning>
      <body className='min-h-screen bg-background font-sans antialiased'>
        <ThemeProvider>
          <div className='relative flex min-h-screen flex-col'>
            <Header />
            <main className='flex-1'>{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
