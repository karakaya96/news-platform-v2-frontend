export const SITE_NAME = 'NewsHaberGlobal';
export const SITE_DESCRIPTION =
  'Son dakika haberleri, analizler ve derinlemesine raporlama için güvenilir kaynağınız.';
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
  { name: 'Ana Sayfa', nameEn: 'Home', href: '/' },
  { name: 'Kategoriler', nameEn: 'Categories', href: '/categories' },
  { name: 'Arama', nameEn: 'Search', href: '/search' },
  { name: 'Bildirim Al', nameEn: 'Subscribe', href: '/subscribe' },
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

export const CATEGORY_TRANSLATIONS: Record<string, { name: string; nameEn: string; description: string; descriptionEn: string }> = {
  technology: {
    name: 'Teknoloji',
    nameEn: 'Technology',
    description: 'Teknoloji, yapay zeka ve inovasyonda son gelişmeler',
    descriptionEn: 'Latest developments in technology, AI and innovation',
  },
  'world-news': {
    name: 'Dünya Haberleri',
    nameEn: 'World News',
    description: 'Dünya genelinden son dakika haberleri',
    descriptionEn: 'Breaking news from around the world',
  },
  economy: {
    name: 'Ekonomi',
    nameEn: 'Economy',
    description: 'Piyasalar, iş dünyası ve finans haberleri',
    descriptionEn: 'Markets, business and finance news',
  },
  sports: {
    name: 'Spor',
    nameEn: 'Sports',
    description: 'Skorlar, analizler ve spor haberleri',
    descriptionEn: 'Scores, analysis and sports news',
  },
  science: {
    name: 'Bilim',
    nameEn: 'Science',
    description: 'Keşifler, araştırma ve bilimsel gelişmeler',
    descriptionEn: 'Discoveries, research and scientific developments',
  },
  health: {
    name: 'Sağlık',
    nameEn: 'Health',
    description: 'Sağlık, tıp ve kamu sağlığı haberleri',
    descriptionEn: 'Health, medicine and public health news',
  },
  entertainment: {
    name: 'Eğlence',
    nameEn: 'Entertainment',
    description: 'Kültür, sinema, müzik ve ünlüler',
    descriptionEn: 'Culture, cinema, music and celebrities',
  },
  politics: {
    name: 'Siyaset',
    nameEn: 'Politics',
    description: 'Devlet, politika ve siyasi analizler',
    descriptionEn: 'Government, policy and political analysis',
  },
  gundem: {
    name: 'Gündem',
    nameEn: 'Agenda',
    description: 'Gündem haberleri ve son dakika gelişmeleri',
    descriptionEn: 'Agenda news and latest developments',
  },
};

const SLUG_ALIASES: Record<string, string> = {
  'tech': 'technology',
  'world': 'world-news',
  'agenda': 'gundem',
  'business': 'economy',
  'sport': 'sports',
  'sci': 'science',
  'ent': 'entertainment',
  'pol': 'politics',
  'health': 'health',
};

export function translateCategoryName(slug: string, fallback: string, locale = 'tr'): string {
  const normalizedSlug = SLUG_ALIASES[slug] || slug;
  const cat = CATEGORY_TRANSLATIONS[normalizedSlug];
  if (!cat) return fallback;
  return locale === 'en' ? cat.nameEn : cat.name;
}

export function translateCategoryDescription(slug: string, fallback: string, locale = 'tr'): string {
  const cat = CATEGORY_TRANSLATIONS[slug];
  if (!cat) return fallback;
  return locale === 'en' ? cat.descriptionEn : cat.description;
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
