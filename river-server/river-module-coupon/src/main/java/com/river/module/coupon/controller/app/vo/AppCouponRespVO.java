package com.river.module.coupon.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "用户 App - 优惠券 Response VO")
@Data
public class AppCouponRespVO {

    @Schema(description = "优惠券编号", requiredMode = Schema.RequiredMode.REQUIRED, example = "1024")
    private Long id;

    @Schema(description = "优惠码", requiredMode = Schema.RequiredMode.REQUIRED, example = "SAVE20")
    private String code;

    @Schema(description = "SEO 页面标题（为空回退 title）", example = "20% Off Nike Coupon Code 2026")
    private String metaTitle;

    @Schema(description = "SEO meta 描述（为空回退 terms）", example = "Save 20% on your order with Nike coupon code SAVE20")
    private String metaDescription;

    @Schema(description = "优惠描述", example = "Save 20% on your order")
    private String description;

    @Schema(description = "折扣类型: 1=百分比 2=固定金额 3=免邮", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    private Integer discountType;

    @Schema(description = "折扣值", requiredMode = Schema.RequiredMode.REQUIRED, example = "20")
    private BigDecimal discountValue;

    @Schema(description = "最低消费", example = "50.00")
    private BigDecimal minPurchase;

    @Schema(description = "商家编号", example = "1")
    private Long merchantId;

    @Schema(description = "商家名称", example = "Nike")
    private String merchantName;

    @Schema(description = "商家Logo", example = "https://example.com/logo.png")
    private String merchantLogo;

    @Schema(description = "结束时间")
    private LocalDateTime endTime;

    @Schema(description = "是否已验证", example = "true")
    private Boolean verified;

    @Schema(description = "跳转链接", example = "https://www.amazon.com/dp/B0123456")
    private String gotoUrl;

    @Schema(description = "商家信息")
    private AppCouponMerchantRespVO merchant;

}
