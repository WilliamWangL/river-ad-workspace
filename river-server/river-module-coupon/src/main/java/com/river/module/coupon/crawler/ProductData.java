package com.river.module.coupon.crawler;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * 爬虫采集的商品数据
 */
@Data
@Builder
public class ProductData {

    /** 商品标题 */
    private String title;

    /** 商品描述 */
    private String description;

    /** 原价 */
    private BigDecimal originalPrice;

    /** 折后价 / 优惠价 */
    private BigDecimal dealPrice;

    /** 商品图片 URL（主图） */
    private String imageUrl;

    /** 商品图片 URL 列表（详情页多张图） */
    private List<String> imageUrls;

    /** 商品页面 URL */
    private String productUrl;

    /** 是否有优惠价格（dealPrice < originalPrice） */
    public boolean hasDiscount() {
        return originalPrice != null && dealPrice != null
                && dealPrice.compareTo(BigDecimal.ZERO) > 0
                && originalPrice.compareTo(BigDecimal.ZERO) > 0
                && dealPrice.compareTo(originalPrice) < 0;
    }

    /**
     * 计算折扣百分比
     * @return 折扣百分比，如 50 表示 50% off
     */
    public int getDiscountPercent() {
        if (!hasDiscount()) return 0;
        return originalPrice.subtract(dealPrice)
                .multiply(BigDecimal.valueOf(100))
                .divide(originalPrice, 0, java.math.RoundingMode.HALF_UP)
                .intValue();
    }

    /**
     * 获取最佳主图 URL（优先用 imageUrls 第一张，否则回退 imageUrl）
     */
    public String getBestImageUrl() {
        if (imageUrls != null && !imageUrls.isEmpty()) {
            return imageUrls.get(0);
        }
        return imageUrl;
    }

    /**
     * 将额外的图片 URL 添加到 imageUrls 列表（自动去重）
     */
    public void addImageUrl(String url) {
        if (url == null || url.isBlank()) return;
        if (imageUrls == null) {
            imageUrls = new ArrayList<>();
        }
        if (!imageUrls.contains(url)) {
            imageUrls.add(url);
        }
    }
}
