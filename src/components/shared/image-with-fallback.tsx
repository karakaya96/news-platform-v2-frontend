'use client';

import React, { useState } from 'react';
import Image, { type ImageProps } from 'next/image';

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

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(fallback)}
    />
  );
}
