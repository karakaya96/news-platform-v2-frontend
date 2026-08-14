'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';
import { Header } from './header';
import type { PublicSettings } from '@/lib/settings';
import { NAVIGATION } from '@/lib/constants';

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
