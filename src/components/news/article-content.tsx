'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useRef } from 'react';

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
    if (!containerRef.current) return;
    containerRef.current.querySelectorAll<HTMLElement>('div[data-video-embed]').forEach((el) => {
      if (el.querySelector('video, iframe')) return;
      const src = el.getAttribute('data-video-src');
      if (!src) return;
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.className = 'w-full h-full object-contain';
      const source = document.createElement('source');
      source.src = src;
      source.type = 'video/mp4';
      video.appendChild(source);
      el.appendChild(video);
    });
  }, [sanitizedContent]);

  return (
    <>
      <style>{`
        .article-content-wrapper .video-embed-wrapper {
          position: relative !important;
          margin: 24px 0 !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          background: #000 !important;
          aspect-ratio: 16 / 9 !important;
          width: 100% !important;
        }
        .article-content-wrapper .video-embed-wrapper iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
          border-radius: 12px !important;
        }
        .article-content-wrapper .video-embed-wrapper video {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          background: #000 !important;
        }
        .article-content-wrapper iframe:not(.video-embed-wrapper iframe) {
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
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </>
  );
}
