package com.river.module.coupon.crawler;

import cn.hutool.core.util.StrUtil;
import com.river.framework.common.biz.affiliate.MerchantCommonApi;
import com.river.framework.common.biz.affiliate.dto.MerchantSimpleRespDTO;
import com.river.framework.common.enums.CommonStatusEnum;
import com.river.module.coupon.dal.dataobject.DealDO;
import com.river.module.coupon.dal.mysql.DealMapper;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Deal 爬虫服务
 * <p>
 * 负责协调爬取流程：
 * 1. 从数据库获取启用状态且有域名的商家列表
 * 2. 对每个商家网站进行爬取
 * 3. 过滤出有折扣的商品（原价 > 现价）
 * 4. 去重（同一 sourceUrl + merchantId 不重复入库）
 * 5. 将有折扣的商品写入 river_coupon_deal 表
 */
@Slf4j
@Service
public class DealCrawlerService {

    /** 每次爬取间隔（毫秒），避免给目标站点造成过大压力 */
    private static final long DELAY_BETWEEN_MERCHANTS_MS = 2000;

    /** 单次任务最多处理的商家数 */
    private static final int MAX_MERCHANTS_PER_RUN = 20;

    /** 最低折扣百分比阈值，低于此值的商品不入库 */
    private static final int MIN_DISCOUNT_PERCENT = 5;

    @Resource
    private MerchantCommonApi merchantApi;

    @Resource
    private MerchantSiteScraper genericScraper;

    @Resource
    private DealMapper dealMapper;

    /**
     * 执行全量爬取
     *
     * @return 执行摘要
     */
    public String crawlAllMerchants() {
        List<MerchantSimpleRespDTO> merchants = merchantApi.getActiveMerchantsWithDomain();
        if (merchants.isEmpty()) {
            log.info("[DealCrawler] No active merchants with domain found");
            return "No active merchants with domain";
        }

        log.info("[DealCrawler] Found {} merchants to crawl", merchants.size());

        int totalCreated = 0;
        int totalUpdated = 0;
        int totalSkipped = 0;
        int merchantsCrawled = 0;

        for (MerchantSimpleRespDTO merchant : merchants) {
            if (merchantsCrawled >= MAX_MERCHANTS_PER_RUN) {
                log.info("[DealCrawler] Reached max merchants per run ({}), stopping",
                        MAX_MERCHANTS_PER_RUN);
                break;
            }

            try {
                CrawlResult result = crawlMerchant(merchant);
                totalCreated += result.created;
                totalUpdated += result.updated;
                totalSkipped += result.skipped;
                merchantsCrawled++;
            } catch (Exception e) {
                log.error("[DealCrawler] Error crawling merchant {} ({}): {}",
                        merchant.getName(), merchant.getId(), e.getMessage());
            }

            try {
                Thread.sleep(DELAY_BETWEEN_MERCHANTS_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        String summary = String.format(
                "Crawled %d merchants: created=%d, updated=%d, skipped=%d",
                merchantsCrawled, totalCreated, totalUpdated, totalSkipped);
        log.info("[DealCrawler] {}", summary);
        return summary;
    }

    /**
     * 根据 ID 获取商家信息（供 DealCrawlerJob 使用）
     */
    public MerchantSimpleRespDTO getMerchantById(Long merchantId) {
        return merchantApi.getMerchant(merchantId);
    }

    /**
     * 爬取单个商家
     */
    public CrawlResult crawlMerchant(MerchantSimpleRespDTO merchant) {
        CrawlResult result = new CrawlResult();
        if (merchant == null || StrUtil.isBlank(merchant.getDomain())) {
            return result;
        }

        String baseUrl = normalizeDomain(merchant.getDomain());
        log.info("[DealCrawler] Crawling merchant {} ({}) at {}",
                merchant.getName(), merchant.getId(), baseUrl);

        List<ProductData> products = genericScraper.scrape(baseUrl);
        log.info("[DealCrawler] Scraped {} products from {}", products.size(), merchant.getName());

        for (ProductData product : products) {
            if (!product.hasDiscount()) {
                result.skipped++;
                continue;
            }

            if (product.getDiscountPercent() < MIN_DISCOUNT_PERCENT) {
                log.debug("[DealCrawler] Skipping low discount ({}%): {}",
                        product.getDiscountPercent(), product.getTitle());
                result.skipped++;
                continue;
            }

            // 去重：根据 sourceUrl + merchantId 判断是否已存在
            String sourceUrl = product.getProductUrl();
            if (StrUtil.isBlank(sourceUrl)) {
                sourceUrl = baseUrl;
            }

            DealDO existingDeal = dealMapper.selectBySourceUrlAndMerchantId(
                    sourceUrl, merchant.getId());

            if (existingDeal != null) {
                // 更新已有 deal 的价格、描述、图片信息
                boolean changed = false;
                if (product.getOriginalPrice() != null
                        && !product.getOriginalPrice().equals(existingDeal.getOriginalPrice())) {
                    existingDeal.setOriginalPrice(product.getOriginalPrice());
                    changed = true;
                }
                if (product.getDealPrice() != null
                        && !product.getDealPrice().equals(existingDeal.getDealPrice())) {
                    existingDeal.setDealPrice(product.getDealPrice());
                    changed = true;
                }
                if (changed) {
                    existingDeal.setDiscountPercent(product.getDiscountPercent());
                }
                // 回填详情页描述和图片（如果之前没有或现在有更好数据）
                if (product.getDescription() != null && !product.getDescription().isBlank()
                        && (existingDeal.getDescription() == null
                            || existingDeal.getDescription().isBlank()
                            || product.getDescription().length() > existingDeal.getDescription().length())) {
                    existingDeal.setDescription(product.getDescription());
                    changed = true;
                }
                if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()
                        && (existingDeal.getImageUrls() == null
                            || existingDeal.getImageUrls().isEmpty())) {
                    existingDeal.setImageUrls(product.getImageUrls());
                    existingDeal.setImageUrl(product.getBestImageUrl());
                    changed = true;
                }
                if (changed) {
                    dealMapper.updateById(existingDeal);
                    result.updated++;
                } else {
                    result.skipped++;
                }
                continue;
            }

            // 创建新 deal
            DealDO deal = buildDealDO(product, merchant);
            dealMapper.insert(deal);
            result.created++;
            log.debug("[DealCrawler] Created deal: {} ({}% off)",
                    deal.getTitle(), deal.getDiscountPercent());
        }

        log.info("[DealCrawler] Merchant {} done: created={}, updated={}, skipped={}",
                merchant.getName(), result.created, result.updated, result.skipped);
        return result;
    }

    // ==================== 工具方法 ====================

    private String normalizeDomain(String domain) {
        if (domain == null) return "";
        domain = domain.trim();
        if (!domain.startsWith("http://") && !domain.startsWith("https://")) {
            domain = "https://" + domain;
        }
        if (domain.endsWith("/")) {
            domain = domain.substring(0, domain.length() - 1);
        }
        return domain;
    }

    private DealDO buildDealDO(ProductData product, MerchantSimpleRespDTO merchant) {
        DealDO deal = new DealDO();
        deal.setMerchantId(merchant.getId());
        deal.setTitle(product.getTitle());
        deal.setSlug(generateCrawlerSlug(product.getTitle(), product.getProductUrl()));
        deal.setDescription(product.getDescription());
        deal.setOriginalPrice(product.getOriginalPrice());
        deal.setDealPrice(product.getDealPrice());
        deal.setDiscountPercent(product.getDiscountPercent());
        // 主图：优先用详情页第一张图，否则回退列表页图片
        deal.setImageUrl(product.getBestImageUrl());
        // 详情页多图
        if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
            deal.setImageUrls(product.getImageUrls());
        }
        deal.setGotoUrl(product.getProductUrl());
        deal.setSourceUrl(product.getProductUrl());
        deal.setStatus(CommonStatusEnum.ENABLE.getStatus());
        deal.setStartTime(LocalDateTime.now());
        deal.setRegions(merchant.getRegions());
        deal.setExclusive(false);
        deal.setHotScore(0);
        deal.setFeatured(false);
        return deal;
    }

    /**
     * 为爬虫采集的 deal 生成 slug
     * 格式：{normalized-title}-{hash6}
     */
    private String generateCrawlerSlug(String title, String url) {
        String namePart = title.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        if (namePart.length() > 60) {
            namePart = namePart.substring(0, 60).replaceAll("-$", "");
        }
        if (namePart.isEmpty()) {
            namePart = "deal";
        }
        String hash = hashString(url != null ? url : title).substring(0, 6);
        return namePart + "-" + hash;
    }

    private String hashString(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(Math.abs(input.hashCode()));
        }
    }

    /**
     * 单次商家爬取结果统计
     */
    static class CrawlResult {
        int created = 0;
        int updated = 0;
        int skipped = 0;
    }
}
