/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'foto.sondakika.com',
      },
      {
        protocol: 'https',
        hostname: '**.sondakika.com',
      },
    ],
  },
};

module.exports = nextConfig;
