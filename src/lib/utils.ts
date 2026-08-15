import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function parseDate(dateString: string): Date {
  if (!dateString) return new Date(Number.NaN);

  // Handle SQLite datetime format: '2026-06-27 15:04:13' (no T, no Z)
  // Convert to ISO format: '2026-06-27T15:04:13'
  const isoString = dateString.includes('T') ? dateString : dateString.replace(' ', 'T');

  return new Date(isoString);
}

export function formatDate(dateString: string | null | undefined, locale = 'tr'): string {
  if (!dateString) return '';
  const date = parseDate(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Istanbul',
  });
}

export function formatDateWithTime(dateString: string | null | undefined, locale = 'tr'): string {
  if (!dateString) return '';
  const date = parseDate(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Istanbul',
  });
  const time = date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  });
  return `${day} ${time}`;
}

export function formatRelativeDate(dateString: string | null | undefined, locale = 'tr'): string {
  if (!dateString) return '';
  const date = parseDate(dateString);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const isTr = locale === 'tr';
  if (diffInSeconds < 60) return isTr ? 'Az önce' : 'Just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return isTr ? `${mins} dk önce` : `${mins}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return isTr ? `${hours} saat önce` : `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return isTr ? `${days} gün önce` : `${days}d ago`;
  }
  return formatDate(dateString, locale);
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

export function getAvatarUrl(avatarUrl: string | null | undefined, userName: string): string {
  if (avatarUrl) return avatarUrl;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName || 'User')}`;
}
