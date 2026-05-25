import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { FolderOpen } from 'lucide-react';
import api from '@/lib/api';
import type { Category } from '@/types';
import { CATEGORY_COLORS, translateCategoryName, translateCategoryDescription } from '@/lib/constants';

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

  return (
    <div className='container mx-auto px-4 py-8'>
      <h1 className='text-3xl font-bold mb-2'>Kategoriler</h1>
      <p className='text-muted-foreground mb-8'>İlginizi çeken konuları keşfedin.</p>
      
      {categories.length === 0 ? (
        <div className='text-center py-16 text-muted-foreground'>
          <FolderOpen className='h-12 w-12 mx-auto mb-4 opacity-40' />
          <p>Kategori bulunamadı.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {categories.map((category) => {
            const colorClass = CATEGORY_COLORS[category.slug] || 'bg-gray-500';
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className='group block p-6 rounded-xl border bg-card card-hover'
              >
                <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center mb-4 shadow-sm`}>
                  <FolderOpen className='h-5 w-5 text-white' />
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
