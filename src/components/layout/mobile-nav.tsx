'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { PublicSettings } from '@/lib/settings';
import { getSiteName } from '@/lib/settings';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PublicSettings;
  navigation: { name: string; href: string }[];
}

export function MobileNav({ isOpen, onClose, settings, navigation }: MobileNavProps) {
  if (!isOpen) return null;

  const siteName = getSiteName(settings);

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Slide-out Menu */}
      <div className="fixed right-0 top-0 h-full w-80 bg-background shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-semibold">{siteName}</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <nav className="p-4">
          <ul className="space-y-4">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="block text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                  onClick={onClose}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
