import type { Metadata } from 'next';
import api from '@/lib/api';
import type { News, Category } from '@/types';
import HomePageClient from './home-page';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'NewsPlatform - Güvenilir Haber Kaynağınız',
  description: 'Son dakika haberleri, analizler ve derinlemesine raporlama için güvenilir kaynağınız.',
};

async function getFeaturedNews(): Promise<News[]> {
  const res = await api.get<News[]>('/api/news/featured');
  return res.data || [];
}

async function getBreakingNews(): Promise<News[]> {
  const res = await api.get<News[]>('/api/news/breaking');
  return res.data || [];
}

async function getLatestNews(): Promise<News[]> {
  const res = await api.get<News[]>('/api/news', { revalidate: 30 });
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

export default async function HomePage() {
  const [featured, breaking, latest, categories] = await Promise.all([
    getFeaturedNews(),
    getBreakingNews(),
    getLatestNews(),
    getCategories(),
  ]);

  const categorySections = categories.slice(0, 3);
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
