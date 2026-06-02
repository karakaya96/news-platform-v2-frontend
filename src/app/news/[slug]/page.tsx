export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Eye, User, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import type { News } from '@/types';
import { formatDate } from '@/lib/utils';
import { CategoryBadge } from '@/components/news/category-badge';
import { ShareButtons } from '@/components/news/share-buttons';
import { RelatedArticles } from '@/components/news/related-articles';
import { CommentsSection } from '@/components/news/comments-section';
import { ArticleContent } from '@/components/news/article-content';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SITE_URL, SITE_NAME } from '@/lib/constants';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string): Promise<News | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';
  const res = await fetch(`${apiUrl}/api/news/${slug}`, { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data || null;
}

async function getRelatedArticles(categorySlug: string): Promise<News[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';
  const res = await fetch(`${apiUrl}/api/news?category=${categorySlug}&limit=4`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

async function getComments(newsId: number) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';
    const res = await fetch(`${apiUrl}/api/comments/${newsId}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return { comments: [], count: 0 };
    const data = await res.json();
    const comments = data.data || [];
    const approved = comments.filter((c: any) => c.status === 'approved');
    return { comments: approved, count: approved.length };
  } catch {
    return { comments: [], count: 0 };
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) {
    return { title: 'Haber Bulunamadı' };
  }

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt || '';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.published_at || undefined,
      modifiedTime: article.updated_at || undefined,
      authors: article.author_name ? [article.author_name] : [],
      images: article.image_url ? [{ url: article.image_url, width: 1200, height: 630, alt: article.title }] : [],
      url: `${SITE_URL}/news/${article.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.image_url ? [article.image_url] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/news/${article.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const [related, commentsData] = await Promise.all([
    article.category_slug ? getRelatedArticles(article.category_slug) : Promise.resolve([]),
    getComments(article.id),
  ]);

  return (
    <article className='container mx-auto px-4 py-8'>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            description: article.seo_description || article.excerpt,
            image: article.image_url || undefined,
            datePublished: article.published_at || undefined,
            dateModified: article.updated_at || article.published_at || undefined,
            author: article.author_name ? {
              '@type': 'Person',
              name: article.author_name,
            } : undefined,
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME || 'NewsHaberGlobal',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${SITE_URL}/news/${article.slug}`,
            },
          }),
        }}
      />
      {/* Back Button */}
      <div className='mb-6'>
        <Button variant='ghost' asChild>
          <Link href='/' className='flex items-center gap-2'>
            <ArrowLeft className='h-4 w-4' />
            Ana Sayfaya Dön
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <header className='mb-8'>
        {article.category_name && article.category_slug && (
          <CategoryBadge category={{ name: article.category_name, slug: article.category_slug, color: article.category_color } as any} className='mb-4' />
        )}
        <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-serif'>
          {article.title}
        </h1>
        <p className='text-lg text-muted-foreground mb-6'>{article.excerpt}</p>
        
        {/* Meta */}
        <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
          {article.author_name && (
            <div className='flex items-center gap-2'>
              <Avatar className='h-8 w-8'>
                <AvatarFallback>{article.author_name[0]}</AvatarFallback>
              </Avatar>
              <span>{article.author_name}</span>
            </div>
          )}
          <div className='flex items-center gap-1'>
            <Calendar className='h-4 w-4' />
            <time dateTime={article.published_at || undefined}>{formatDate(article.published_at || '')}</time>
          </div>
          <div className='flex items-center gap-1'>
            <Eye className='h-4 w-4' />
            <span>{article.view_count.toLocaleString()} görüntülenme</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {article.image_url && (
        <div className='relative aspect-[16/9] mb-8 rounded-xl overflow-hidden bg-muted'>
          <img
            src={article.image_url}
            alt={article.title}
            className='w-full h-full object-cover'
          />
        </div>
      )}

      {/* Share Buttons */}
      <div className='mb-8'>
        <ShareButtons
          url={`${SITE_URL}/news/${article.slug}`}
          title={article.title}
        />
      </div>

      {/* Article Content */}
      <div className='max-w-4xl mx-auto mb-12'>
        <ArticleContent content={article.content} />
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className='max-w-4xl mx-auto mb-8'>
          <div className='flex flex-wrap gap-2'>
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className='px-3 py-1 text-sm bg-muted rounded-full'
              >
                #{tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio */}
      {article.author_name && (
        <div className='max-w-4xl mx-auto mb-12 p-6 bg-muted rounded-lg'>
          <div className='flex items-start gap-4'>
            <Avatar className='h-16 w-16'>
              <AvatarFallback>{article.author_name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className='font-semibold mb-1'>{article.author_name}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Related Articles */}
      <div className='max-w-6xl mx-auto'>
        <RelatedArticles articles={related} />
      </div>

      {/* Comments Section */}
      <CommentsSection
        newsId={article.id}
        initialComments={commentsData.comments}
        initialCount={commentsData.count}
      />
    </article>
  );
}
