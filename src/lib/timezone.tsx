'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';

const TIMEZONE_COOKIE = 'SITE_TIMEZONE';
const DEFAULT_TIMEZONE = 'Europe/Istanbul';

const TimezoneContext = createContext<string>(DEFAULT_TIMEZONE);

export function TimezoneProvider({
  timezone: initialTimezone,
  children,
}: {
  timezone: string;
  children: ReactNode;
}) {
  const [timezone, setTimezone] = useState(initialTimezone || DEFAULT_TIMEZONE);

  useEffect(() => {
    // Cookie'den oku (admin değişiklik yapmış olabilir)
    const match = document.cookie.match(new RegExp(`${TIMEZONE_COOKIE}=([^;]+)`));
    if (match && match[1] !== timezone) {
      setTimezone(match[1]);
    }
  }, [timezone]);

  useEffect(() => {
    // Timezone değiştiğinde cookie'yi güncelle
    const currentCookie = document.cookie.match(new RegExp(`${TIMEZONE_COOKIE}=([^;]+)`))?.[1];
    if (currentCookie !== timezone) {
      document.cookie = `${TIMEZONE_COOKIE}=${timezone}; path=/; max-age=31536000; SameSite=Lax`;
    }
  }, [timezone]);

  return <TimezoneContext.Provider value={timezone}>{children}</TimezoneContext.Provider>;
}

export function useTimezone(): string {
  return useContext(TimezoneContext);
}

// Server-side için: settings objesinden timezone oku
export function getTimezoneFromSettings(settings: Record<string, string>): string {
  return settings.site_timezone || DEFAULT_TIMEZONE;
}
