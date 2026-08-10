import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://deals.ecommica.com';

// 受限路径：所有爬虫均禁止访问
const DISALLOW_PATHS = ['/api/', '/admin/', '/go/'];

// 明确支持的爬虫列表
const ALLOWED_BOTS = [
  // =========================
  // Search Engines
  // =========================
  'Googlebot',
  'Bingbot',
  'YandexBot',

  // =========================
  // AI Crawlers - OpenAI ChatGPT
  // =========================
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',

  // =========================
  // AI Crawlers - Google Gemini
  // =========================
  'Google-Extended',

  // =========================
  // AI Crawlers - Anthropic Claude
  // =========================
  'ClaudeBot',

  // =========================
  // AI Crawlers - Perplexity AI
  // =========================
  'PerplexityBot',

  // =========================
  // AI Crawlers - Alibaba Qwen / Tongyi Qianwen
  // =========================
  'QwenBot',
  'TongyiBot',
  'AlibabaBot',

  // =========================
  // AI Crawlers - DeepSeek
  // =========================
  'DeepSeekBot',

  // =========================
  // AI Crawlers - Moonshot AI Kimi
  // =========================
  'KimiBot',
  'MoonshotBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 通配规则：默认允许所有爬虫访问公开内容
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW_PATHS,
      },
      // 明确列出支持的爬虫（搜索引擎 + AI 爬虫）
      ...ALLOWED_BOTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW_PATHS,
      })),
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
