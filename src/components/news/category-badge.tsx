import React from 'react';
import type { Category } from '@/types';
import { CATEGORY_COLORS, translateCategoryName } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const colorClass = CATEGORY_COLORS[category.slug] || 'bg-gray-500';

  return (
    <span
      className={cn(
        'inline-block px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-sm',
        colorClass,
        className
      )}
    >
      {translateCategoryName(category.slug, category.name)}
    </span>
  );
}
