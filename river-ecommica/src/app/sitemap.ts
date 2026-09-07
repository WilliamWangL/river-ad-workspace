import { MetadataRoute } from 'next';
import { fetchStores, fetchDeals, fetchPosts, fetchCategories } from '@/lib/api';
import { Category } from '@/types';

// 使用 ISR 代替 force-dynamic，每 10 分钟重新生成
export const revalidate = 600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://deals.ecommica.com';
const LOCALES = ['en', 'zh'];
const DEFAULT_LOCALE = 'en';

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
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: buildAlternates(`/category/${category.slug}`),
    });
    if (category.children) {
      for (const child of category.children) {
        pages.push({
          url: `${BASE_URL}/${locale}/category/${child.slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
          alternates: buildAlternates(`/category/${child.slug}`),
        });
      }
    }
  }
  return pages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
      alternates: buildAlternates(''),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/stores`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: buildAlternates('/stores'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/deals`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
      alternates: buildAlternates('/deals'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/coupons`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
      alternates: buildAlternates('/coupons'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
      alternates: buildAlternates('/blog'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: buildAlternates('/categories'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: buildAlternates('/about'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
      alternates: buildAlternates('/contact'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: buildAlternates('/faq'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: buildAlternates('/privacy-policy'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: buildAlternates('/terms-of-service'),
    },
    {
      url: `${BASE_URL}/${DEFAULT_LOCALE}/cookie-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.3,
      alternates: buildAlternates('/cookie-policy'),
    },
  ];

  try {
    const [storesResult, dealsResult, postsResult, categories] = await Promise.all([
      fetchStores({ pageSize: 200 }),
      fetchDeals({ pageSize: 200 }),
      fetchPosts({ pageSize: 200 }),
      fetchCategories(),
    ]);

    const stores = storesResult.list;
    const deals = dealsResult.list;
    const posts = postsResult.list;

    const categoryPages = buildCategoryPages(categories, DEFAULT_LOCALE);

    const storePages: MetadataRoute.Sitemap = stores
      .filter(store => store.slug)
      .map(store => ({
        url: `${BASE_URL}/${DEFAULT_LOCALE}/stores/${store.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        alternates: buildAlternates(`/stores/${store.slug}`),
      }));

    const dealPages: MetadataRoute.Sitemap = deals
      .filter(deal => deal.slug)
      .map(deal => ({
        url: `${BASE_URL}/${DEFAULT_LOCALE}/deals/${deal.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
        alternates: buildAlternates(`/deals/${deal.slug}`),
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

    return [...staticPages, ...categoryPages, ...storePages, ...dealPages, ...blogPages];
  } catch {
    // 构建时 API 不可用，只返回静态页面，动态页面将在运行时生成
    return staticPages;
  }
}
