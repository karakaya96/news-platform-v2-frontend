'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useRef } from 'react';

interface ArticleContentProps {
  content: string;
}

function processVideoEmbeds(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;

  div.querySelectorAll<HTMLElement>('div[data-video-embed]').forEach((el) => {
    const src = el.getAttribute('data-video-src') || '';
    const type = el.getAttribute('data-video-type') || 'iframe';
    const title = el.getAttribute('data-video-title') || '';

    if (!src) {
      el.remove();
      return;
    }

    if (type === 'mp4' || type === 'video') {
      el.outerHTML = `<div class="video-embed" style="position:relative;margin:24px 0;border-radius:12px;overflow:hidden;background:#000;padding-bottom:56.25%;height:0;">
        <video controls playsinline preload="metadata" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;background:#000;" ${title ? `poster=""` : ''}>
          <source src="${src}" type="video/mp4" />
        </video>
      </div>`;
    } else if (src.includes('youtube.com') || src.includes('youtu.be')) {
      const match = src.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const videoId = match?.[1] || '';
      el.outerHTML = `<div class="video-embed" style="position:relative;margin:24px 0;border-radius:12px;overflow:hidden;background:#000;padding-bottom:56.25%;height:0;">
        <iframe src="https://www.youtube.com/embed/${videoId}" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" />
      </div>`;
    } else if (src.includes('vimeo.com')) {
      const match = src.match(/vimeo\.com\/(\d+)/);
      const videoId = match?.[1] || '';
      el.outerHTML = `<div class="video-embed" style="position:relative;margin:24px 0;border-radius:12px;overflow:hidden;background:#000;padding-bottom:56.25%;height:0;">
        <iframe src="https://player.vimeo.com/video/${videoId}" title="${title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" />
      </div>`;
    } else if (src.includes('dailymotion.com')) {
      const match = src.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
      const videoId = match?.[1] || '';
      el.outerHTML = `<div class="video-embed" style="position:relative;margin:24px 0;border-radius:12px;overflow:hidden;background:#000;padding-bottom:56.25%;height:0;">
        <iframe src="https://www.dailymotion.com/embed/video/${videoId}" title="${title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" />
      </div>`;
    } else {
      el.outerHTML = `<div class="video-embed" style="position:relative;margin:24px 0;border-radius:12px;overflow:hidden;background:#000;padding-bottom:56.25%;height:0;">
        <iframe src="${src}" title="${title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" />
      </div>`;
    }
  });

  return div.innerHTML;
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
      const processed = processVideoEmbeds(sanitizedContent);
      containerRef.current.innerHTML = processed;
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
