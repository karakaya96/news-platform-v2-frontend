import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ArticleSkeleton() {
  return (
    <div className='space-y-4'>
      <Skeleton className='aspect-[16/9] w-full rounded-xl' />
      <Skeleton className='h-8 w-3/4' />
      <Skeleton className='h-4 w-1/2' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-3/4' />
      </div>
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className='rounded-lg border bg-card overflow-hidden'>
      <Skeleton className='aspect-[16/10] w-full' />
      <div className='p-4 space-y-3'>
        <Skeleton className='h-4 w-20' />
        <Skeleton className='h-6 w-full' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-1/3' />
      </div>
    </div>
  );
}

export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {Array.from({ length: count }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FeaturedSkeleton() {
  return (
    <Skeleton className='aspect-[16/9] md:aspect-[21/9] w-full rounded-xl' />
  );
}
