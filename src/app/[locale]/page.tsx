import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import api from '@/lib/api';
import { getPublicSettings, getSiteName } from '@/lib/settings';
import type { Category, News } from '@/types';
import HomePageClient from './home-page';

export const revalidate = 60;
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getPublicSettings();
  const siteName = getSiteName(settings);

  const title =
    settings.seo_title ||
    (locale === 'tr'
      ? `${siteName} - Güvenilir Haber Kaynağınız`
      : `${siteName} - Your Trusted News Source`);

  const description =
    settings.seo_description ||
    (locale === 'tr'
      ? 'Son dakika haberleri, analizler ve derinlemesine raporlama için güvenilir kaynağınız.'
      : 'Your trusted source for breaking news, analysis, and in-depth reporting.');

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      siteName,
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
    },
  };
}

async function getFeaturedNews(): Promise<News[]> {
  const res = await api.get<News[]>('/api/news/featured');
  return res.data || [];
}

async function getBreakingNews(): Promise<News[]> {
  const res = await api.get<News[]>('/api/news/breaking');
  return res.data || [];
}

async function getLatestNews(): Promise<News[]> {
  const res = await api.get<News[]>('/api/news');
  return res.data || [];
}

async function getCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>('/api/categories');
  return res.data || [];
}

async function getCategoryNews(slug: string): Promise<News[]> {
  const res = await api.get<News[]>(`/api/news?category=${slug}&limit=3`);
  return res.data || [];
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [featured, breaking, latest, categories] = await Promise.all([
    getFeaturedNews(),
    getBreakingNews(),
    getLatestNews(),
    getCategories(),
  ]);

  const categorySections = categories;
  const categoryArticles = await Promise.all(
    categorySections.map((cat) => getCategoryNews(cat.slug))
  );

  return (
    <HomePageClient
      featured={featured}
      breaking={breaking}
      latest={latest}
      categories={categories}
      categoryArticles={categoryArticles}
    />
  );
}
