'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { translateCategoryName } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: {
    name: string;
    slug: string;
    color?: string;
  };
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const locale = useLocale();
  const backgroundColor = category.color || '#6366f1';

  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        'inline-block px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-sm hover:opacity-85 transition-opacity',
        className
      )}
      style={{ backgroundColor }}
    >
      {translateCategoryName(category.slug, category.name, locale)}
    </Link>
  );
}
