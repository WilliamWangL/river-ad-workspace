import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',
  // 禁用流式 metadata：动态渲染的详情页默认会将 title/meta 流式注入 <body>，
  // 导致 Googlebot 等爬虫抓到的 HTML 中 <head> 里没有 title（SEO 失效）；
  // 此配置强制所有请求的 metadata 阻塞渲染进 <head>
  htmlLimitedBots: /.*/,
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
      // sitemap 根路径命名：/sitemap.xml（主文件）与 /sitemapN.xml（deal 分片，N≥2）
      // 内部映射到 metadata route /sitemap/[id].xml（id 0 = 主文件，id N-1 = 分片）
      {
        source: '/sitemap.xml',
        destination: '/sitemap/0.xml',
      },
      {
        source: '/sitemap:id.xml',
        destination: '/sitemap/:id.xml',
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
