import { MetadataRoute } from 'next';
import api from '@/lib/api';
import type { News, Category } from '@/types';
import { SITE_URL } from '@/lib/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];

  try {
    // Fetch articles
    const articlesRes = await api.get<News[]>('/api/news?limit=1000');
    const articles = articlesRes.data || [];
    
    const articlePages = articles.map((article) => ({
      url: `${SITE_URL}/news/${article.slug}`,
      lastModified: new Date(article.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Fetch categories
    const categoriesRes = await api.get<Category[]>('/api/categories');
    const categories = categoriesRes.data || [];
    
    const categoryPages = categories.map((category) => ({
      url: `${SITE_URL}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...articlePages, ...categoryPages];
  } catch {
    return staticPages;
  }
}
