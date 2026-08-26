'use client';

import { createContext, type ReactNode, useContext } from 'react';

const DEFAULT_TIMEZONE = 'Europe/Istanbul';

const TimezoneContext = createContext<string>(DEFAULT_TIMEZONE);

export function TimezoneProvider({
  timezone,
  children,
}: {
  timezone: string;
  children: ReactNode;
}) {
  // Props (settings) her zaman kaynaktır, state yok, lifecycle yok
  const tz = timezone || DEFAULT_TIMEZONE;
  return <TimezoneContext.Provider value={tz}>{children}</TimezoneContext.Provider>;
}

export function useTimezone(): string {
  return useContext(TimezoneContext);
}
