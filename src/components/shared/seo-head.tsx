import React from 'react';

interface SeoHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
  publishedTime?: string;
  author?: string;
}

export function generateMetadata({
  title,
  description,
  image,
  url,
  type = 'website',
  publishedTime,
  author,
}: SeoHeadProps) {
  const siteName = 'NewsHaberGlobal';
  const fullTitle = `${title} | ${siteName}`;

  return {
    title: fullTitle,
    description,
    openGraph: {
      title: fullTitle,
      description,
      type,
      url,
      siteName,
      images: image ? [{ url: image, width: 1200, height: 630 }] : [],
      ...(publishedTime && { publishedTime }),
      ...(author && { authors: [author] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : [],
    },
  };
}
