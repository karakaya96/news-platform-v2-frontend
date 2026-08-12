export const revalidate = 60;
export const dynamic = 'force-dynamic';

import { ArrowLeft, Calendar, Eye } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import { ArticleContent } from '@/components/news/article-content';
import { CategoryBadge } from '@/components/news/category-badge';
import { CommentsSection } from '@/components/news/comments-section';
import { RelatedArticles } from '@/components/news/related-articles';
import { ShareButtons } from '@/components/news/share-buttons';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SITE_LOGO_URL, SITE_NAME, SITE_URL } from '@/lib/constants';
import { formatDateWithTime } from '@/lib/utils';
import type { CommentItem, News } from '@/types';

interface PublicSettings {
  comments_enabled: string;
  comments_max_length: string;
  notifications_enabled: string;
  site_name: string;
  [key: string]: string;
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const SANITIZE_OPTIONS = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'img',
    'iframe',
    'video',
    'source',
    'figure',
    'figcaption',
    'div',
    'span',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'pre',
    'code',
    'hr',
    'section',
    'article',
    'aside',
    'header',
    'footer',
  ],
  allowedAttributes: {
    '*': [
      'href',
      'src',
      'alt',
      'title',
      'width',
      'height',
      'class',
      'id',
      'style',
      'target',
      'rel',
      'allowfullscreen',
      'frameborder',
      'allow',
      'controls',
      'preload',
      'poster',
      'type',
      'datetime',
      'cite',
      'data-video-src',
      'data-video-type',
      'data-video-title',
    ],
    a: ['href', 'target', 'rel', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height', 'class', 'style'],
    video: ['src', 'controls', 'preload', 'poster', 'style'],
    source: ['src', 'type'],
    iframe: ['src', 'allowfullscreen', 'frameborder', 'allow', 'width', 'height', 'style'],
    div: ['class', 'style', 'data-video-src', 'data-video-type', 'data-video-title'],
    span: ['class', 'style'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel', 'data'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
    video: ['http', 'https', 'data'],
    source: ['http', 'https', 'data'],
    iframe: ['http', 'https'],
    a: ['http', 'https', 'mailto'],
  },
};

function sanitizeContent(content: string): string {
  return sanitizeHtml(content, SANITIZE_OPTIONS);
}

async function getArticle(slug: string): Promise<News | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';
  try {
    const res = await fetch(`${apiUrl}/api/news/${slug}`, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`API error for ${slug}: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    const article = data.data || null;
    if (article) {
      // Sanitize content on server side using sanitize-html (SSR-safe)
      article.content = sanitizeContent(article.content);
    }
    return article;
  } catch (error) {
    console.error(`Fetch error for ${slug}:`, error);
    return null;
  }
}

async function getRelatedArticles(categorySlug: string): Promise<News[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';
  try {
    const res = await fetch(`${apiUrl}/api/news?category=${categorySlug}&limit=4`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error(`Fetch related error for ${categorySlug}:`, error);
    return [];
  }
}

async function getComments(newsId: number) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';
  try {
    const res = await fetch(`${apiUrl}/api/comments/${newsId}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) return { comments: [], count: 0 };
    const data = await res.json();
    const comments = data.data || [];
    const approved = comments.filter((c: CommentItem) => c.status === 'approved');
    return { comments: approved, count: approved.length };
  } catch (error) {
    console.error(`Fetch comments error for ${newsId}:`, error);
    return { comments: [], count: 0 };
  }
}

async function getPublicSettings(): Promise<PublicSettings> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://news-v2-api.karakaya-mk96.workers.dev';
  try {
    const res = await fetch(`${apiUrl}/api/settings/public/all`, { cache: 'no-store' });
    if (!res.ok) {
      return { comments_enabled: 'true', comments_max_length: '5000', notifications_enabled: 'true', site_name: 'News Platform' };
    }
    const data = await res.json();
    return data.data || { comments_enabled: 'true', comments_max_length: '5000', notifications_enabled: 'true', site_name: 'News Platform' };
  } catch {
    return { comments_enabled: 'true', comments_max_length: '5000', notifications_enabled: 'true', site_name: 'News Platform' };
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getArticle(slug);

    if (!article) {
      return { title: 'Haber Bulunamadı' };
    }

    const title = article.seoTitle || article.title;
    const description = article.seoDescription || article.excerpt || '';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: article.publishedAt || undefined,
        modifiedTime: article.updatedAt || undefined,
        authors: article.authorName ? [article.authorName] : [],
        images: article.imageUrl
          ? [{ url: article.imageUrl, width: 1200, height: 630, alt: article.title }]
          : [],
        url: `${SITE_URL}/news/${article.slug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: article.imageUrl ? [article.imageUrl] : [],
      },
      alternates: {
        canonical: `${SITE_URL}/news/${article.slug}`,
      },
    };
  } catch (error) {
    console.error('generateMetadata error:', error);
    return { title: 'Haber Yükleniyor...' };
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const [related, commentsData, publicSettings] = await Promise.all([
    article.categorySlug ? getRelatedArticles(article.categorySlug) : Promise.resolve([]),
    getComments(article.id),
    getPublicSettings(),
  ]);

  return (
    <article className="container mx-auto px-4 py-8">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            description: article.seoDescription || article.excerpt || undefined,
            articleSection: article.categoryName || undefined,
            keywords:
              article.tags?.map((t: { name: string }) => t.name) ||
              article.seoKeywords?.split(',').map((k: string) => k.trim()) ||
              undefined,
            wordCount: article.content
              ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).length
              : undefined,
            image: article.imageUrl
              ? article.imageAlt
                ? [
                    {
                      '@type': 'ImageObject',
                      url: article.imageUrl,
                      caption: article.imageAlt,
                      width: 1200,
                      height: 630,
                    },
                  ]
                : [{ '@type': 'ImageObject', url: article.imageUrl, width: 1200, height: 630 }]
              : undefined,
            datePublished: article.publishedAt || undefined,
            dateModified: article.updatedAt || article.publishedAt || undefined,
            author: article.authorName
              ? { '@type': 'Person', name: article.authorName }
              : undefined,
            publisher: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
              logo: {
                '@type': 'ImageObject',
                url: SITE_LOGO_URL,
                width: 512,
                height: 512,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${SITE_URL}/news/${article.slug}`,
            },
            isAccessibleForFree: true,
            inLanguage: 'tr',
          }),
        }}
      />
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfaya Dön
          </Link>
        </Button>
      </div>

      {/* Article Header */}
      <header className="mb-8">
        {article.categoryName && article.categorySlug && (
          <CategoryBadge
            category={{
              name: article.categoryName,
              slug: article.categorySlug,
              color: article.categoryColor,
            }}
            className="mb-4"
          />
        )}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-serif">
          {article.title}
        </h1>
        <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {article.authorName && (
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{article.authorName[0]}</AvatarFallback>
              </Avatar>
              <span>{article.authorName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <time dateTime={article.publishedAt || undefined}>
              {formatDateWithTime(article.publishedAt || '')}
            </time>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{article.viewCount.toLocaleString()} görüntülenme</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {article.imageUrl && (
        <div className="relative aspect-[16/9] mb-8 rounded-xl overflow-hidden bg-muted">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="w-full h-full object-cover"
            sizes="100%"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjZDNkM2QzIi8+PC9zdmc+"
            unoptimized
          />
        </div>
      )}

      {/* Share Buttons */}
      <div className="mb-8">
        <ShareButtons url={`${SITE_URL}/news/${article.slug}`} title={article.title} />
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto mb-12">
        <ArticleContent content={article.content} />
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag.id} className="px-3 py-1 text-sm bg-muted rounded-full">
                #{tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio */}
      {article.authorName && (
        <div className="max-w-4xl mx-auto mb-12 p-6 bg-muted rounded-lg">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>{article.authorName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold mb-1">{article.authorName}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Related Articles */}
      <div className="max-w-6xl mx-auto">
        <RelatedArticles articles={related} />
      </div>

      {/* Comments Section */}
      <CommentsSection
        newsId={article.id}
        initialComments={commentsData.comments}
        initialCount={commentsData.count}
        commentsEnabled={publicSettings.comments_enabled !== 'false'}
        commentsMaxLength={Number.parseInt(publicSettings.comments_max_length || '5000', 10)}
      />
    </article>
  );
}
