import type { MetadataRoute } from 'next';
import { getPublicSettings, getSiteUrl } from '@/lib/settings';
import type { Category, News } from '@/types';

const API_URL = 'https://news-v2-api.karakaya-mk96.workers.dev';

async function fetchJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = (await res.json()) as Record<string, unknown>;
    return data.data as T;
  } catch {
    return null;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getPublicSettings();
  const siteUrl = getSiteUrl(settings);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const articles = (await fetchJSON<News[]>('/api/news?limit=1000&status=published')) || [];
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteUrl}/news/${article.slug}`,
    lastModified: article.updatedAt ? new Date(article.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const categories = (await fetchJSON<Category[]>('/api/categories')) || [];
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteUrl}/categories/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...articlePages, ...categoryPages];
}
