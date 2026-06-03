import React from 'react';

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  return (
    <>
      <style>{`
        .article-content-wrapper .video-embed {
          margin: 24px 0 !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        .article-content-wrapper .video-embed video {
          width: 100% !important;
          max-width: 100% !important;
          display: block !important;
          background: #000;
        }
        .article-content-wrapper .video-embed iframe {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          border: 0 !important;
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
        className='article-content-wrapper prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg'
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </>
  );
}
