package com.river.module.coupon.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "用户 App - Deal Response VO")
@Data
public class AppDealRespVO {

    @Schema(description = "Deal编号", requiredMode = Schema.RequiredMode.REQUIRED, example = "1024")
    private Long id;

    @Schema(description = "URL友好标识", requiredMode = Schema.RequiredMode.REQUIRED, example = "50-off-everything")
    private String slug;

    @Schema(description = "Deal标题", requiredMode = Schema.RequiredMode.REQUIRED, example = "50% Off Everything")
    private String title;

    @Schema(description = "Deal描述", example = "Get 50% off sitewide")
    private String description;

    @Schema(description = "SEO 页面标题（为空回退 title）", example = "50% Off Everything - Amazon Deal 2026")
    private String metaTitle;

    @Schema(description = "SEO meta 描述（为空回退 description）", example = "Get 50% off sitewide at Amazon. Limited time offer!")
    private String metaDescription;

    @Schema(description = "原价", example = "100.00")
    private BigDecimal originalPrice;

    @Schema(description = "Deal价格", example = "50.00")
    private BigDecimal dealPrice;

    @Schema(description = "折扣百分比", example = "50")
    private Integer discountPercent;

    @Schema(description = "商家编号", example = "1")
    private Long merchantId;

    @Schema(description = "商家名称", example = "Amazon")
    private String merchantName;

    @Schema(description = "商家Logo", example = "https://example.com/logo.png")
    private String merchantLogo;

    @Schema(description = "Deal图片URL", example = "https://example.com/deal.jpg")
    private String imageUrl;

    @Schema(description = "开始时间")
    private LocalDateTime startTime;

    @Schema(description = "结束时间")
    private LocalDateTime endTime;

    @Schema(description = "是否精选", example = "true")
    private Boolean featured;

    @Schema(description = "跳转链接", example = "https://www.amazon.com/dp/B0123456")
    private String gotoUrl;

    @Schema(description = "商家信息")
    private AppDealMerchantRespVO merchant;

}
