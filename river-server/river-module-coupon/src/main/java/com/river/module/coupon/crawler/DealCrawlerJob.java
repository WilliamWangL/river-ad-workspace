package com.river.module.coupon.crawler;

import com.river.framework.common.biz.affiliate.dto.MerchantSimpleRespDTO;
import com.river.framework.quartz.core.handler.JobHandler;
import com.river.framework.tenant.core.job.TenantJob;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Deal 爬虫定时任务
 * <p>
 * 定时爬取商家网站折扣商品并写入 Deal 表。
 * <p>
 * 使用方式：
 * 在管理后台「定时任务」中新增任务，处理器名称填写 {@code dealCrawlerJob}，
 * 设置合适的 cron 表达式（建议每天执行一次，如 {@code 0 0 3 * * ?} 凌晨 3 点）。
 * <p>
 * 也可以通过 param 参数指定单个商家 ID，仅爬取该商家：
 * <pre>
 *   param = "123"  → 只爬取 merchantId=123 的商家
 *   param = null   → 爬取所有启用且有域名的商家
 * </pre>
 */
@Slf4j
@Component("dealCrawlerJob")
public class DealCrawlerJob implements JobHandler {

    @Resource
    private DealCrawlerService dealCrawlerService;

    @Override
    @TenantJob
    public String execute(String param) throws Exception {
        log.info("[DealCrawlerJob] Starting deal crawler job, param={}", param);

        if (param != null && !param.isBlank()) {
            // 支持指定单个商家 ID
            try {
                Long merchantId = Long.parseLong(param.trim());
                MerchantSimpleRespDTO merchant = dealCrawlerService.getMerchantById(merchantId);
                if (merchant == null) {
                    return "Merchant not found: " + merchantId;
                }
                DealCrawlerService.CrawlResult result = dealCrawlerService.crawlMerchant(merchant);
                return String.format("Merchant %d (%s): created=%d, updated=%d, skipped=%d",
                        merchantId, merchant.getName(),
                        result.created, result.updated, result.skipped);
            } catch (NumberFormatException e) {
                log.warn("[DealCrawlerJob] Invalid param '{}', running full crawl", param);
            }
        }

        return dealCrawlerService.crawlAllMerchants();
    }
}
