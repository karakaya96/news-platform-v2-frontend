import Link from 'next/link';
import { SITE_NAME, SOCIAL_LINKS, NAVIGATION } from '@/lib/constants';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t bg-muted/30'>
      <div className='container mx-auto px-4 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Site Info */}
          <div className='space-y-4'>
            <h3 className='text-lg font-bold text-primary'>{SITE_NAME}</h3>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              Son dakika haberleri, analizler ve derinlemesine raporlama için güvenilir kaynağınız.
            </p>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h4 className='text-sm font-semibold text-foreground'>Hızlı Bağlantılar</h4>
            <nav className='flex flex-col space-y-2.5'>
              {NAVIGATION.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Categories */}
          <div className='space-y-4'>
            <h4 className='text-sm font-semibold text-foreground'>Kategoriler</h4>
            <nav className='flex flex-col space-y-2.5'>
              {[
                { name: 'Teknoloji', slug: 'technology' },
                { name: 'Siyaset', slug: 'politics' },
                { name: 'Ekonomi', slug: 'economy' },
                { name: 'Spor', slug: 'sports' },
                { name: 'Bilim', slug: 'science' },
                { name: 'Sağlık', slug: 'health' },
              ].map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className='text-sm text-muted-foreground hover:text-primary transition-colors'
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          <div className='space-y-4'>
            <h4 className='text-sm font-semibold text-foreground'>Bizi Takip Edin</h4>
            <div className='flex space-x-3'>
              {Object.entries(SOCIAL_LINKS).map(([platform, url]) => (
                <a
                  key={platform}
                  href={url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='h-9 w-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all capitalize text-xs font-medium'
                >
                  {platform[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className='mt-10 pt-8 border-t text-center text-sm text-muted-foreground'>
          <p>&copy; {currentYear} {SITE_NAME}. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
