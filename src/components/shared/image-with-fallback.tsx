'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

interface ImageWithFallbackProps extends Omit<ImageProps, 'onError'> {
  fallback?: string;
}

export function ImageWithFallback({
  src,
  alt,
  fallback = '/placeholder.jpg',
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return <Image {...props} src={imgSrc} alt={alt} onError={() => setImgSrc(fallback)} />;
}
