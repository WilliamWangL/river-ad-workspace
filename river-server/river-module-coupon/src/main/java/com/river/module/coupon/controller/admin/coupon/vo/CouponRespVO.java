package com.river.module.coupon.controller.admin.coupon.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "管理后台 - 优惠券 Response VO")
@Data
public class CouponRespVO {

    @Schema(description = "编号", example = "1")
    private Long id;

    @Schema(description = "商家 ID", example = "1")
    private Long merchantId;

    @Schema(description = "Offer ID", example = "1")
    private Long offerId;

    @Schema(description = "优惠码", example = "SAVE20")
    private String code;

    @Schema(description = "SEO 页面标题（为空回退 title）", example = "20% Off Nike Coupon Code 2026")
    private String metaTitle;

    @Schema(description = "SEO meta 描述（为空回退 terms）", example = "Save 20% on your order with Nike coupon code SAVE20")
    private String metaDescription;

    @Schema(description = "折扣类型：1-百分比 2-固定金额 3-免邮", example = "1")
    private Integer discountType;

    @Schema(description = "折扣值", example = "20.00")
    private BigDecimal discountValue;

    @Schema(description = "最低消费", example = "100.00")
    private BigDecimal minPurchase;

    @Schema(description = "开始时间")
    private LocalDateTime startTime;

    @Schema(description = "结束时间")
    private LocalDateTime endTime;

    @Schema(description = "使用条款")
    private String terms;

    @Schema(description = "来源：1-联盟同步 2-手动录入 3-用户提交", example = "2")
    private Integer source;

    @Schema(description = "是否已验证", example = "true")
    private Boolean verified;

    @Schema(description = "热度分数", example = "100")
    private Integer hotScore;

    @Schema(description = "状态", example = "1")
    private Integer status;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;
}
