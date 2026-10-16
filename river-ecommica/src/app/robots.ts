import { MetadataRoute } from 'next';
import { fetchDealSitemapCount } from '@/lib/api';
import { DEALS_PER_SITEMAP } from './sitemap';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://deals.ecommica.com';

// 构建阶段后端 API 不可达，曾把 count=0 的退化结果静态固化（robots 永远只剩 1 行 Sitemap），
// 改为运行时实时渲染；count 的 fetch 自带 30 分钟数据缓存，不会每次请求都打 DB
export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  // Next.js 的 generateSitemaps 不会生成 sitemap index，
  // 在 robots.txt 中列出全部分片（Google 支持多行 Sitemap 指令）
  let dealCount = 0;
  try {
    dealCount = await fetchDealSitemapCount();
  } catch {
    // API 不可用时仅保留主分片
  }
  const dealShardCount = Math.ceil(dealCount / DEALS_PER_SITEMAP);
  const sitemaps = [
    `${BASE_URL}/sitemap/0.xml`,
    ...Array.from({ length: dealShardCount }, (_, i) => `${BASE_URL}/sitemap/${i + 1}.xml`),
  ];

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/go/'],
      },
    ],
    sitemap: sitemaps,
    host: BASE_URL,
  };
}
