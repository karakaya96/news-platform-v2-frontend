'use client';

import DOMPurify from 'isomorphic-dompurify';

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
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

  return (
    <>
      <style>{`
        .article-content-wrapper .video-embed-wrapper {
          margin: 24px 0 !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          background: #000 !important;
        }
        .article-content-wrapper .video-embed-wrapper video {
          display: block !important;
          width: 100% !important;
          max-height: 500px !important;
          background: #000 !important;
        }
        .article-content-wrapper .video-embed-wrapper iframe {
          display: block !important;
          width: 100% !important;
          aspect-ratio: 16 / 9 !important;
          border: 0 !important;
          border-radius: 12px !important;
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
        className="article-content-wrapper prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </>
  );
}
