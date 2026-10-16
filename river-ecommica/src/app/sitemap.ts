import { MetadataRoute } from 'next';
import { fetchStores, fetchPosts, fetchCategories, fetchDealSitemapPage, fetchDealSitemapHot } from '@/lib/api';
import { Category } from '@/types';

// 构建阶段（CI docker build）后端 API 不可达，fetch 失败的结果会被静态固化
// （曾导致 robots 只剩 1 行、主分片只剩 12 条且永不自愈），因此强制运行时实时渲染：
// Google 抓取 sitemap 频率低，每片一次轻量分页查询（实测 0.8~6s）完全可接受
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://deals.ecommica.com';
const LOCALES = ['en', 'zh'];
const DEFAULT_LOCALE = 'en';

/** Google sitemap 单文件上限 50,000 URL */
export const DEALS_PER_SITEMAP = 50000;

/** deal 分片数量上界：每片 5 万，当前约 80 万 deal = 16 片；超过 100 万需调大。
 *  固定集合不依赖运行时接口，保证构建/运行行为确定；robots.txt 动态只列实际片数 */
const MAX_DEAL_SITEMAP_SHARDS = 20;

function buildAlternates(path: string) {
  return {
    languages: Object.fromEntries(LOCALES.map(l => [l, `${BASE_URL}/${l}${path}`])),
  };
}

// Helper function to build category pages from category tree
function buildCategoryPages(categories: Category[], locale: string): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [];
  for (const category of categories) {
    pages.push({
      url: `${BASE_URL}/${locale}/category/${category.slug}`,
      lastModified: category.updateTime ? new Date(category.updateTime) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: buildAlternates(`/category/${category.slug}`),
    });
    if (category.children) {
      for (const child of category.children) {
        pages.push({
          url: `${BASE_URL}/${locale}/category/${child.slug}`,
          lastModified: child.updateTime ? new Date(child.updateTime) : undefined,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
          alternates: buildAlternates(`/category/${child.slug}`),
        });
      }
    }
  }
  return pages;
}

/** id = 0 的主分片：静态页 + 分类 + 商家 + 博客 */
async function buildMainSitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态页面无持久的内容变更时间，省略 lastModified 以保持信号真实
  // （Google 会忽略恒新的虚假 lastmod）
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}`,
      changeFrequency: 'daily' as const,
      priority: 1,
      alternates: buildAlternates(''),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/stores`,
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: buildAlternates('/stores'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/deals`,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
      alternates: buildAlternates('/deals'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/coupons`,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
      alternates: buildAlternates('/coupons'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/blog`,
      changeFrequency: 'daily' as const,
      priority: 0.8,
      alternates: buildAlternates('/blog'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/categories`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: buildAlternates('/categories'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/about`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: buildAlternates('/about'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/contact`,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: buildAlternates('/contact'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/faq`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: buildAlternates('/faq'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/privacy-policy`,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: buildAlternates('/privacy-policy'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/terms-of-service`,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: buildAlternates('/terms-of-service'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/cookie-policy`,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: buildAlternates('/cookie-policy'),
    },
  ];

  try {
    const [storesResult, postsResult, categories, hotDeals] = await Promise.all([
      fetchStores({ pageSize: 200 }),
      fetchPosts({ pageSize: 200 }),
      fetchCategories(),
      // 热门 deal 拉取失败不影响主文件其余部分
      fetchDealSitemapHot().catch(() => []),
    ]);

    const stores = storesResult.list;
    const posts = postsResult.list;

    const categoryPages = buildCategoryPages(categories, DEFAULT_LOCALE);

    const storePages: MetadataRoute.Sitemap = stores
      .filter(store => store.slug)
      .map(store => ({
        url: `${BASE_URL}/${DEFAULT_LOCALE}/stores/${store.slug}`,
        lastModified: store.updateTime ? new Date(store.updateTime) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        alternates: buildAlternates(`/stores/${store.slug}`),
      }));

    const blogPages: MetadataRoute.Sitemap = posts
      .filter(post => post.slug)
      .map(post => ({
        url: `${BASE_URL}/${DEFAULT_LOCALE}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
        alternates: buildAlternates(`/blog/${post.slug}`),
      }));

    // 热门 deal（运营内容，非 feed 长尾）：进主文件让 Google 优先抓取
    const hotDealPages: MetadataRoute.Sitemap = hotDeals
      .filter(deal => deal.slug)
      .map(deal => ({
        url: `${BASE_URL}/${DEFAULT_LOCALE}/deals/${deal.slug}`,
        lastModified: deal.updateTime ? new Date(deal.updateTime) : undefined,
        changeFrequency: 'daily' as const,
        priority: 0.9,
        alternates: buildAlternates(`/deals/${deal.slug}`),
      }));

    return [...staticPages, ...categoryPages, ...storePages, ...blogPages, ...hotDealPages];
  } catch {
    // 构建时 API 不可用，只返回静态页面，动态页面将在运行时生成
    return staticPages;
  }
}

export async function generateSitemaps() {
  // id 0：主分片（静态/分类/商家/博客）；id 1..N：deal 分片（每片最多 5 万 URL）
  return [{ id: 0 }, ...Array.from({ length: MAX_DEAL_SITEMAP_SHARDS }, (_, i) => ({ id: i + 1 }))];
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const rawId = Number(await props.id);
  const shardId = isNaN(rawId) ? 0 : rawId;

  // deal 分片：轻量分页接口按 id 升序返回 slug + 真实更新时间
  if (shardId >= 1) {
    try {
      const dealsResult = await fetchDealSitemapPage(shardId, DEALS_PER_SITEMAP);
      return dealsResult.list
        .filter(deal => deal.slug)
        .map(deal => ({
          url: `${BASE_URL}/${DEFAULT_LOCALE}/deals/${deal.slug}`,
          lastModified: deal.updateTime ? new Date(deal.updateTime) : undefined,
          changeFrequency: 'daily' as const,
          priority: 0.8,
          alternates: buildAlternates(`/deals/${deal.slug}`),
        }));
    } catch {
      // API 暂不可用时返回空分片，ISR 下轮再验证时重新生成
      return [];
    }
  }

  return buildMainSitemap();
}
