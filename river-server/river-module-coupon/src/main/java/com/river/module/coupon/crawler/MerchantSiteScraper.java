package com.river.module.coupon.crawler;

import java.util.List;

/**
 * 商家网站爬虫接口
 * <p>
 * 不同的商家网站可以实现不同的爬取策略：
 * - {@link GenericMerchantScraper} 通用爬虫，基于 JSON-LD + meta 标签 + CSS 选择器
 * - 未来可以针对特定网站实现专用爬虫（如 AmazonScraper、WalmartScraper）
 */
public interface MerchantSiteScraper {

    /**
     * 爬取商家网站，返回包含折扣的商品列表
     *
     * @param baseUrl 商家网站域名，如 "https://www.example.com"
     * @return 爬取到的商品数据列表
     */
    List<ProductData> scrape(String baseUrl);
}
