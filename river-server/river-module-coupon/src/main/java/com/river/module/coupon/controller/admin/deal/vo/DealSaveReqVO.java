package com.river.module.coupon.controller.admin.deal.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "管理后台 - Deal 创建/修改 Request VO")
@Data
public class DealSaveReqVO {

    @Schema(description = "编号", example = "1")
    private Long id;

    @Schema(description = "商家 ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "商家不能为空")
    private Long merchantId;

    @Schema(description = "Offer ID", example = "1")
    private Long offerId;

    @Schema(description = "标题", requiredMode = Schema.RequiredMode.REQUIRED, example = "50% Off Electronics")
    @NotBlank(message = "标题不能为空")
    private String title;

    @Schema(description = "描述")
    private String description;

    @Schema(description = "SEO 页面标题（为空回退 title）", example = "50% Off Electronics - Amazon Deal 2026")
    private String metaTitle;

    @Schema(description = "SEO meta 描述（为空回退 description）", example = "Get 50% off electronics at Amazon. Limited time offer!")
    private String metaDescription;

    @Schema(description = "原价", example = "199.99")
    private BigDecimal originalPrice;

    @Schema(description = "优惠价", example = "99.99")
    private BigDecimal dealPrice;

    @Schema(description = "折扣百分比", example = "50")
    private Integer discountPercent;

    @Schema(description = "开始时间")
    private LocalDateTime startTime;

    @Schema(description = "结束时间")
    private LocalDateTime endTime;

    @Schema(description = "库存限制", example = "100")
    private Integer stockLimit;

    @Schema(description = "图片 URL")
    private String imageUrl;

    @Schema(description = "热度分数", example = "100")
    private Integer hotScore;

    @Schema(description = "是否精选", example = "true")
    private Boolean featured;

    @Schema(description = "状态", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "状态不能为空")
    private Integer status;
}
