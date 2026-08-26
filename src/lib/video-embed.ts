/**
 * Process data-video-embed divs into actual <video> or <iframe> elements.
 * Client-side only (uses DOM APIs).
 */
export function processVideoEmbeds(html: string): string {
  if (typeof document === 'undefined') return html;

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

    const wrapperStyle =
      'position:relative;margin:24px 0;border-radius:12px;overflow:hidden;background:#000;padding-bottom:56.25%;height:0;';
    const mediaStyle =
      'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;background:#000;';
    const iframeStyle = 'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';

    if (type === 'mp4' || type === 'video') {
      el.outerHTML = `<div class="video-embed" style="${wrapperStyle}">
        <video controls playsinline preload="metadata" style="${mediaStyle}">
          <source src="${src}" type="video/mp4" />
        </video>
      </div>`;
    } else if (src.includes('youtube.com') || src.includes('youtu.be')) {
      const match = src.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      const videoId = match?.[1] || '';
      el.outerHTML = `<div class="video-embed" style="${wrapperStyle}">
        <iframe src="https://www.youtube.com/embed/${videoId}" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="${iframeStyle}" />
      </div>`;
    } else if (src.includes('vimeo.com')) {
      const match = src.match(/vimeo\.com\/(\d+)/);
      const videoId = match?.[1] || '';
      el.outerHTML = `<div class="video-embed" style="${wrapperStyle}">
        <iframe src="https://player.vimeo.com/video/${videoId}" title="${title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="${iframeStyle}" />
      </div>`;
    } else if (src.includes('dailymotion.com')) {
      const match = src.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/);
      const videoId = match?.[1] || '';
      el.outerHTML = `<div class="video-embed" style="${wrapperStyle}">
        <iframe src="https://www.dailymotion.com/embed/video/${videoId}" title="${title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="${iframeStyle}" />
      </div>`;
    } else {
      el.outerHTML = `<div class="video-embed" style="${wrapperStyle}">
        <iframe src="${src}" title="${title}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="${iframeStyle}" />
      </div>`;
    }
  });

  return div.innerHTML;
}
