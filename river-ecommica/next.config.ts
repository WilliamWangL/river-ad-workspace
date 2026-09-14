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
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
