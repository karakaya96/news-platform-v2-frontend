'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant='ghost' size='icon' className='h-9 w-9'>
        <div className='h-4 w-4' />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={cycleTheme}
      className='h-9 w-9 relative overflow-hidden'
      title={
        theme === 'light'
          ? 'Aydınlık mod (karanlığa geç)'
          : theme === 'dark'
          ? 'Karanlık mod (sistem tercihine geç)'
          : 'Sistem tercihi (aydınlığa geç)'
      }
    >
      <Sun
        className={`h-4 w-4 absolute transition-all duration-300 ${
          theme === 'light'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'
        }`}
      />
      <Moon
        className={`h-4 w-4 absolute transition-all duration-300 ${
          theme === 'dark'
            ? 'rotate-0 scale-100 opacity-100'
            : '-rotate-90 scale-0 opacity-0'
        }`}
      />
      <Monitor
        className={`h-4 w-4 absolute transition-all duration-300 ${
          theme === 'system'
            ? 'rotate-0 scale-100 opacity-100'
            : 'rotate-90 scale-0 opacity-0'
        }`}
      />
    </Button>
  );
}
