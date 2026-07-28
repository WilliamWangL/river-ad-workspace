import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {
    root: __dirname,
  },
  // 本地开发时将 /go/ 代理到后端（生产环境由 nginx 处理）
  async rewrites() {
    return [
      {
        source: '/go/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:48080/app-api'}/api/go/:path*`,
      },
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
      {
        protocol: 'https',
        hostname: '*.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '*.samsclubimages.com',
      },
      {
        protocol: 'https',
        hostname: 'i5.samsclubimages.com',
      },
      {
        protocol: 'https',
        hostname: '*.walmartimages.com',
      },
      {
        protocol: 'https',
        hostname: '*.tripcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'ak-d.tripcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.admitad.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.admitad-connect.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'cdn.admitad.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'cdn.admitad-connect.com',
        pathname: '/**',
      },
       {
        protocol: 'http',
        hostname: 'tripcdn.com',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
