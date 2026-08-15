import Image from 'next/image';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { formatDateWithTime } from '@/lib/utils';
import type { News } from '@/types';
import { CategoryBadge } from './category-badge';

interface NewsCardProps {
  article: News;
}

export function NewsCard({ article }: NewsCardProps) {
  const t = useTranslations('news');
  const locale = useLocale();
  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <div className="rounded-xl border bg-card overflow-hidden card-hover">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiBmaWxsPSIjZDNkM2QzIi8+PC9zdmc+"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
              <span className="text-slate-400 text-sm">{t('noImage')}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="p-5">
          {article.categoryName && article.categorySlug && (
            <CategoryBadge
              category={{
                name: article.categoryName,
                slug: article.categorySlug,
                color: article.categoryColor,
              }}
              className="mb-3"
            />
          )}
          <h3 className="text-base font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {article.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
          <div className="flex items-center text-xs text-muted-foreground">
            {article.authorName && <span className="mr-3 font-medium">{article.authorName}</span>}
            <time dateTime={article.publishedAt || undefined}>
              {formatDateWithTime(article.publishedAt, locale)}
            </time>
          </div>
        </div>
      </div>
    </Link>
  );
}
