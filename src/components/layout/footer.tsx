import Link from 'next/link';
import { CATEGORY_TRANSLATIONS, NAVIGATION } from '@/lib/constants';
import type { PublicSettings } from '@/lib/settings';
import { getSiteName, getSiteDescription, getSocialLinks } from '@/lib/settings';

interface FooterProps {
  settings: PublicSettings;
  navigation: typeof NAVIGATION;
}

export function Footer({ settings, navigation }: FooterProps) {
  const currentYear = new Date().getFullYear();
  const siteName = getSiteName(settings);
  const siteDescription = getSiteDescription(settings);
  const socialLinks = getSocialLinks(settings);

  const footerCategories = Object.entries(CATEGORY_TRANSLATIONS).map(([slug, info]) => ({
    slug,
    name: info.name,
  }));

  const socialEntries = Object.entries(socialLinks).filter(([, url]) => url);

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Site Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">{siteName}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {siteDescription}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Hızlı Bağlantılar</h4>
            <nav className="flex flex-col space-y-2.5">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Kategoriler</h4>
            <nav className="flex flex-col space-y-2.5">
              {footerCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categories/${category.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Links */}
          {socialEntries.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground">Bizi Takip Edin</h4>
              <div className="flex space-x-3">
                {socialEntries.map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-9 w-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all capitalize text-xs font-medium"
                  >
                    {platform === 'instagram' ? 'IG' : platform === 'telegram' ? 'TG' : platform[0].toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>
            &copy; {currentYear} {siteName}. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
