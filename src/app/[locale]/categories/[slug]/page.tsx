export const revalidate = 60;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { NewsGrid } from '@/components/news/news-grid';
import { Pagination } from '@/components/shared/pagination';
import api from '@/lib/api';
import { translateCategoryDescription, translateCategoryName } from '@/lib/constants';
import { getPublicSettings, getSiteName, getSiteUrl, getLogoUrl } from '@/lib/settings';
import type { Category, News } from '@/types';

interface CategoryPageProps {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

async function getCategory(slug: string): Promise<Category | null> {
  const res = await api.get<Category>(`/api/categories/${slug}`);
  return res.data || null;
}

async function getCategoryNews(
  slug: string,
  page = 1
): Promise<{ articles: News[]; totalPages: number }> {
  const res = await api.get<News[]>(`/api/news?category=${slug}&page=${page}&limit=12`);
  return {
    articles: res.data || [],
    totalPages: res.pagination?.totalPages || 1,
  };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'categories' });
  const [category, settings] = await Promise.all([getCategory(slug), getPublicSettings()]);
  const siteName = getSiteName(settings);
  const siteUrl = getSiteUrl(settings);
  const logoUrl = getLogoUrl(settings);

  if (!category) {
    return { title: t('categoryNotFound') };
  }

  return {
    title: translateCategoryName(slug, category.name),
    description: translateCategoryDescription(
      slug,
      category.description || `${category.name} ${t('categoryNews')}`
    ),
    openGraph: {
      title: translateCategoryName(slug, category.name),
      description: translateCategoryDescription(
        slug,
        category.description || `${category.name} ${t('categoryNews')}`
      ),
      type: 'website',
      url: `${siteUrl}/categories/${slug}`,
      siteName,
      images: [{ url: logoUrl, width: 512, height: 512, alt: siteName }],
    },
    twitter: {
      card: 'summary_large_image',
      title: translateCategoryName(slug, category.name),
      description: translateCategoryDescription(
        slug,
        category.description || `${category.name} ${t('categoryNews')}`
      ),
      images: [logoUrl],
    },
    alternates: {
      canonical: `${siteUrl}/categories/${slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug, locale } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number.parseInt(pageParam || '1', 10);
  const category = await getCategory(slug);
  const t = await getTranslations({ locale, namespace: 'categories' });

  if (!category) {
    notFound();
  }

  const { articles, totalPages } = await getCategoryNews(slug, page);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Category Header */}
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {translateCategoryName(slug, category.name)}
        </h1>
        {category.description && (
          <p className="text-lg text-muted-foreground">
            {translateCategoryDescription(slug, category.description)}
          </p>
        )}
      </header>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t('noNews')}</p>
        </div>
      ) : (
        <>
          <NewsGrid articles={articles} />
          <Pagination currentPage={page} totalPages={totalPages} basePath={`/categories/${slug}`} />
        </>
      )}
    </div>
  );
}
