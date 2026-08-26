const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';

export interface PublicSettings {
  site_name: string;
  site_description: string;
  site_url: string;
  site_logo: string;
  site_favicon: string;
  site_language: string;
  site_timezone: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_og_image: string;
  social_twitter: string;
  social_facebook: string;
  social_instagram: string;
  social_youtube: string;
  social_telegram: string;
  email_from_name: string;
  email_from_address: string;
  email_reply_to: string;
  comments_enabled: string;
  comments_max_length: string;
  notifications_enabled: string;
  notifications_email_enabled: string;
  [key: string]: string;
}

const DEFAULTS: PublicSettings = {
  site_name: 'NewsHaberGlobal',
  site_description:
    'Son dakika haberleri, analizler ve derinlemesine raporlama için güvenilir kaynağınız.',
  site_url: 'https://newshaberglobal.vercel.app',
  site_logo: '',
  site_favicon: '',
  site_language: 'tr',
  site_timezone: 'Europe/Istanbul',
  seo_title: '',
  seo_description: '',
  seo_keywords: 'haber, son dakika, güncel haberler, Türkiye haberleri, dünya haberleri',
  seo_og_image: '',
  social_twitter: '',
  social_facebook: '',
  social_instagram: '',
  social_youtube: '',
  social_telegram: '',
  email_from_name: 'NewsHaberGlobal',
  email_from_address: 'noreply@newshaberglobal.com',
  email_reply_to: '',
  comments_enabled: 'true',
  comments_max_length: '5000',
  notifications_enabled: 'true',
  notifications_email_enabled: 'true',
};

export async function getPublicSettings(): Promise<PublicSettings> {
  try {
    const res = await fetch(`${API_URL}/api/settings/public/all`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return DEFAULTS;
    const data = await res.json();
    return { ...DEFAULTS, ...data.data };
  } catch {
    return DEFAULTS;
  }
}

export function getSiteUrl(settings: PublicSettings): string {
  return settings.site_url || DEFAULTS.site_url;
}

export function getSiteName(settings: PublicSettings): string {
  return settings.site_name || DEFAULTS.site_name;
}

export function getSiteDescription(settings: PublicSettings): string {
  return settings.site_description || DEFAULTS.site_description;
}

export function getLogoUrl(settings: PublicSettings): string {
  if (settings.site_logo) return settings.site_logo;
  const url = getSiteUrl(settings);
  return `${url}/favicon.png`;
}

export function getFaviconUrl(settings: PublicSettings): string {
  if (settings.site_favicon) return settings.site_favicon;
  return '/favicon.png';
}

export function getSocialLinks(settings: PublicSettings) {
  return {
    twitter: settings.social_twitter || '',
    facebook: settings.social_facebook || '',
    instagram: settings.social_instagram || '',
    youtube: settings.social_youtube || '',
    telegram: settings.social_telegram || '',
  };
}
