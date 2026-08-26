'use client';

import { useEffect, useState } from 'react';

const TIMEZONE_COOKIE = 'SITE_TIMEZONE';
const DEFAULT_TIMEZONE = 'Europe/Istanbul';

export function getTimezoneFromCookie(): string {
  if (typeof document === 'undefined') return DEFAULT_TIMEZONE;
  const match = document.cookie.match(new RegExp(`${TIMEZONE_COOKIE}=([^;]+)`));
  return match ? match[1] : DEFAULT_TIMEZONE;
}

export function setTimezoneCookie(timezone: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${TIMEZONE_COOKIE}=${timezone}; path=/; max-age=31536000; SameSite=Lax`;
}

export function useTimezone(): string {
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);

  useEffect(() => {
    setTimezone(getTimezoneFromCookie());
  }, []);

  return timezone;
}
