'use client';

import { usePathname } from '@/i18n/navigation';
import type { NAVIGATION } from '@/lib/constants';
import type { PublicSettings } from '@/lib/settings';
import { Footer } from './footer';
import { Header } from './header';

interface LayoutShellProps {
  settings: PublicSettings;
  navigation: typeof NAVIGATION;
  children: React.ReactNode;
}

export function LayoutShell({ settings, navigation, children }: LayoutShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname.includes('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header settings={settings} navigation={navigation} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} navigation={navigation} />
    </div>
  );
}
