export const SITE_NAME = 'NewsHaberGlobal';
export const SITE_DESCRIPTION = 'Son dakika haberleri, analizler ve derinlemesine raporlama için güvenilir kaynağınız.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://newshaberglobal.vercel.app';
export const SITE_LOGO_URL = `${SITE_URL}/favicon.png`;
export const SITE_LANGUAGE = 'tr';
export const GOOGLE_SITE_VERIFICATION = 'BdderFGFwmNoekb0M33cR23m4_2x7zNbHLjwcaJ_WTY';

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/newshaberglobal',
  facebook: 'https://facebook.com/newshaberglobal',
  linkedin: 'https://linkedin.com/company/newshaberglobal',
  youtube: 'https://youtube.com/@newshaberglobal',
};

export const NAVIGATION = [
  { name: 'Ana Sayfa', href: '/' },
  { name: 'Kategoriler', href: '/categories' },
  { name: 'Arama', href: '/search' },
  { name: 'Bildirim Al', href: '/subscribe' },
];

export const CATEGORY_COLORS: Record<string, string> = {
  technology: '#3b82f6',
  'world-news': '#6366f1',
  economy: '#10b981',
  sports: '#f97316',
  science: '#14b8a6',
  health: '#ec4899',
  entertainment: '#a855f7',
  politics: '#ef4444',
  gundem: '#f59e0b',
};

export const CATEGORY_TRANSLATIONS: Record<string, { name: string; description: string }> = {
  technology: { name: 'Teknoloji', description: 'Teknoloji, yapay zeka ve inovasyonda son gelişmeler' },
  'world-news': { name: 'Dünya Haberleri', description: 'Dünya genelinden son dakika haberleri' },
  economy: { name: 'Ekonomi', description: 'Piyasalar, iş dünyası ve finans haberleri' },
  sports: { name: 'Spor', description: 'Skorlar, analizler ve spor haberleri' },
  science: { name: 'Bilim', description: 'Keşifler, araştırma ve bilimsel gelişmeler' },
  health: { name: 'Sağlık', description: 'Sağlık, tıp ve kamu sağlığı haberleri' },
  entertainment: { name: 'Eğlence', description: 'Kültür, sinema, müzik ve ünlüler' },
  politics: { name: 'Siyaset', description: 'Devlet, politika ve siyasi analizler' },
  gundem: { name: 'Gündem', description: 'Gündem haberleri ve son dakika gelişmeleri' },
};

export function translateCategoryName(slug: string, fallback: string): string {
  return CATEGORY_TRANSLATIONS[slug]?.name || fallback;
}

export function translateCategoryDescription(slug: string, fallback: string): string {
  return CATEGORY_TRANSLATIONS[slug]?.description || fallback;
}

export const BREAKING_NEWS_INTERVAL = 5000;

export const ARTICLE_LIMITS = {
  homepage: {
    featured: 5,
    breaking: 3,
    latest: 6,
    perCategory: 3,
  },
  category: 12,
  search: 12,
  related: 4,
};
