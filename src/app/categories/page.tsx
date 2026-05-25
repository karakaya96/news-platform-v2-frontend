import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import api from '@/lib/api';
import type { Category } from '@/types';
import { CATEGORY_COLORS, translateCategoryName, translateCategoryDescription } from '@/lib/constants';
import { getCategoryIcon } from '@/components/news/category-icons';

export const metadata: Metadata = {
  title: 'Kategoriler',
  description: 'Kategorilere göre haberlere göz atın.',
};

async function getCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>('/api/categories');
  return res.data || [];
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  function EmptyIcon() {
    return (
      <svg className='h-12 w-12 mx-auto mb-4 opacity-40' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
        <rect x='2' y='3' width='20' height='14' rx='2' />
        <line x1='8' y1='21' x2='16' y2='21' />
        <line x1='12' y1='17' x2='12' y2='21' />
      </svg>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-2'>Kategoriler</h1>
      <p className='text-muted-foreground mb-8'>İlginizi çeken konuları keşfedin.</p>
      
      {categories.length === 0 ? (
        <div className='text-center py-16 text-muted-foreground'>
          <EmptyIcon />
          <p>Kategori bulunamadı.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.slug);
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className='group block p-6 rounded-xl border bg-card card-hover'
              >
                <div
                  className='w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:-rotate-3'
                  style={{ backgroundColor: CATEGORY_COLORS[category.slug] || '#6b7280' }}
                >
                  <Icon className='h-6 w-6 text-white' />
                </div>
                <h2 className='text-base font-semibold mb-1.5 group-hover:text-primary transition-colors'>
                  {translateCategoryName(category.slug, category.name)}
                </h2>
                {category.description && (
                  <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed'>
                    {translateCategoryDescription(category.slug, category.description)}
                  </p>
                )}
                {category.article_count !== undefined && (
                  <p className='text-xs text-muted-foreground mt-3 font-medium'>
                    {category.article_count} haber
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
