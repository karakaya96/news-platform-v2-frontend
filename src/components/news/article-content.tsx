'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useRef } from 'react';
import { processVideoEmbeds } from '@/lib/video-embed';

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const sanitizedContent = DOMPurify.sanitize(content, {
    ADD_TAGS: ['iframe', 'video', 'source', 'div', 'span'],
    ADD_ATTR: [
      'allow',
      'allowfullscreen',
      'frameborder',
      'scrolling',
      'data-video-embed',
      'data-video-src',
      'data-video-type',
      'data-video-title',
      'controls',
      'playsinline',
      'preload',
    ],
  });

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = processVideoEmbeds(sanitizedContent);
    }
  }, [sanitizedContent]);

  return (
    <>
      <style>{`
        .article-content-wrapper .video-embed {
          position: relative !important;
          margin: 24px 0 !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          background: #000 !important;
          padding-bottom: 56.25% !important;
          height: 0 !important;
        }
        .article-content-wrapper .video-embed iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
          border-radius: 12px !important;
        }
        .article-content-wrapper .video-embed video {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100% !important;
          object-fit: contain !important;
          background: #000;
        }
        .article-content-wrapper iframe:not(.video-embed iframe) {
          width: 100% !important;
          max-width: 100% !important;
          aspect-ratio: 16/9 !important;
          border-radius: 12px !important;
          margin: 24px 0 !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="article-content-wrapper prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
      />
    </>
  );
}
