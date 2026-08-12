import { useTranslations } from 'next-intl';
import type { News } from '@/types';
import { NewsCard } from './news-card';

interface RelatedArticlesProps {
  articles: News[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  const t = useTranslations('news');
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold mb-6">{t('relatedNews')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
