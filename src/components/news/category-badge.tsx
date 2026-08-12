'use client';

import { CATEGORY_COLORS, translateCategoryName } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

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
  const colorClass = category.color || CATEGORY_COLORS[category.slug] || 'bg-gray-500';

  return (
    <span
      className={cn(
        'inline-block px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-sm',
        colorClass,
        className
      )}
    >
      {translateCategoryName(category.slug, category.name, locale)}
    </span>
  );
}
