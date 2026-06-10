import { SITE_URL, SITE_NAME, SITE_LANGUAGE } from '@/lib/constants';

const API_URL = 'https://news-v2-api.karakaya-mk96.workers.dev';

interface NewsArticle {
  slug: string;
  title: string;
  published_at: string;
  updated_at?: string;
  category_name?: string;
  image_url?: string;
  keywords?: string;
}

async function fetchRecentNews(): Promise<NewsArticle[]> {
  try {
    // Google News sitemap: only articles published in last 48 hours
    const res = await fetch(`${API_URL}/api/news?limit=1000&status=published`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    const articles: NewsArticle[] = data.data || [];

    // Filter: only last 48 hours
    const cutoff = Date.now() - 48 * 60 * 60 * 1000;
    return articles.filter((a) => {
      const pubDate = a.published_at ? new Date(a.published_at).getTime() : 0;
      return pubDate >= cutoff;
    });
  } catch {
    return [];
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const articles = await fetchRecentNews();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${articles
  .map(
    (article) => `  <url>
    <loc>${escapeXml(`${SITE_URL}/news/${article.slug}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(SITE_NAME)}</news:name>
        <news:language>${SITE_LANGUAGE}</news:language>
      </news:publication>
      <news:publication_date>${article.published_at ? new Date(article.published_at).toISOString() : ''}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
      ${article.keywords ? `<news:keywords>${escapeXml(article.keywords)}</news:keywords>` : ''}
      ${article.category_name ? `<news:genres>${escapeXml(article.category_name)}</news:genres>` : ''}
    </news:news>
    ${
      article.image_url
        ? `<image:image>
      <image:loc>${escapeXml(article.image_url)}</image:loc>
      <image:title>${escapeXml(article.title)}</image:title>
    </image:image>`
        : ''
    }
    <lastmod>${article.updated_at ? new Date(article.updated_at).toISOString() : article.published_at ? new Date(article.published_at).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
      'CDN-Cache-Control': 'public, max-age=300',
      'Vercel-CDN-Cache-Control': 'public, max-age=300',
    },
  });
}
