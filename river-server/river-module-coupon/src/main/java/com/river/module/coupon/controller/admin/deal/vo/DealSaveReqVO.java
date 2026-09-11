package com.river.module.coupon.controller.admin.deal.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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

    @Schema(description = "来源联盟网络 ID", example = "1")
    private Long networkId;

    @Schema(description = "联盟原始 ID", example = "admitad-12345")
    private String externalId;

    @Schema(description = "标题", requiredMode = Schema.RequiredMode.REQUIRED, example = "50% Off Electronics")
    @NotBlank(message = "标题不能为空")
    private String title;

    @Schema(description = "Deal 别名（为空时根据标题自动生成）", example = "50-off-electronics")
    private String slug;

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

    @Schema(description = "适用地区（ISO 代码列表）", example = "[\"US\", \"GB\"]")
    private List<String> regions;

    @Schema(description = "分类 ID（逗号分隔）", example = "1,2,3")
    private String categoryIds;

    @Schema(description = "跳转链接", example = "https://example.com/deal")
    private String gotoUrl;

    @Schema(description = "是否独家", example = "true")
    private Boolean exclusive;

    @Schema(description = "热度分数", example = "100")
    private Integer hotScore;

    @Schema(description = "是否精选", example = "true")
    private Boolean featured;

    @Schema(description = "状态", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "状态不能为空")
    private Integer status;
}
