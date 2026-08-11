/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'imgcdn.ensonhaber.com',
      },
      {
        protocol: 'https',
        hostname: 'vcdn.ensonhaber.com',
      },
      {
        protocol: 'https',
        hostname: '*.karakaya-mk96.workers.dev',
      },
      {
        protocol: 'https',
        hostname: 'image.cnnturk.com',
      },
      {
        protocol: 'https',
        hostname: 'foto.haberler.com',
      },
      {
        protocol: 'https',
        hostname: 'images.ntv.com.tr',
      },
      {
        protocol: 'https',
        hostname: 'image.hurimg.com',
      },
      {
        protocol: 'https',
        hostname: 'trthaberstatic.cdn.wp.trt.com.tr',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'CDN-Cache-Control', value: 'no-store' },
          { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/categories/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'CDN-Cache-Control', value: 'no-store' },
          { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/news/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'CDN-Cache-Control', value: 'no-store' },
          { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
