export const revalidate = 60;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewsGrid } from '@/components/news/news-grid';
import { Pagination } from '@/components/shared/pagination';
import api from '@/lib/api';
import {
  SITE_LOGO_URL,
  SITE_NAME,
  SITE_URL,
  translateCategoryDescription,
  translateCategoryName,
} from '@/lib/constants';
import type { Category, News } from '@/types';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
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
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: 'Kategori Bulunamadı' };
  }

  return {
    title: translateCategoryName(slug, category.name),
    description: translateCategoryDescription(
      slug,
      category.description || `${category.name} kategorisindeki son haberler.`
    ),
    openGraph: {
      title: translateCategoryName(slug, category.name),
      description: translateCategoryDescription(
        slug,
        category.description || `${category.name} kategorisindeki son haberler.`
      ),
      type: 'website',
      url: `${SITE_URL}/categories/${slug}`,
      siteName: SITE_NAME,
      images: [{ url: SITE_LOGO_URL, width: 512, height: 512, alt: SITE_NAME }],
    },
    twitter: {
      card: 'summary_large_image',
      title: translateCategoryName(slug, category.name),
      description: translateCategoryDescription(
        slug,
        category.description || `${category.name} kategorisindeki son haberler.`
      ),
      images: [SITE_LOGO_URL],
    },
    alternates: {
      canonical: `${SITE_URL}/categories/${slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Number.parseInt(pageParam || '1', 10);
  const category = await getCategory(slug);

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
          <p>Bu kategoride henüz haber bulunamadı.</p>
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
