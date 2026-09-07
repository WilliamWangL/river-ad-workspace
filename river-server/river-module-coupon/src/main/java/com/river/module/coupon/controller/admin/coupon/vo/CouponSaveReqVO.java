package com.river.module.coupon.controller.admin.coupon.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(description = "管理后台 - 优惠券创建/修改 Request VO")
@Data
public class CouponSaveReqVO {

    @Schema(description = "编号", example = "1")
    private Long id;

    @Schema(description = "商家 ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "商家不能为空")
    private Long merchantId;

    @Schema(description = "Offer ID", example = "1")
    private Long offerId;

    @Schema(description = "优惠码", requiredMode = Schema.RequiredMode.REQUIRED, example = "SAVE20")
    @NotBlank(message = "优惠码不能为空")
    private String code;

    @Schema(description = "SEO 页面标题（为空回退 title）", example = "20% Off Nike Coupon Code 2026")
    private String metaTitle;

    @Schema(description = "SEO meta 描述（为空回退 terms）", example = "Save 20% on your order with Nike coupon code SAVE20")
    private String metaDescription;

    @Schema(description = "折扣类型：1-百分比 2-固定金额 3-免邮", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "折扣类型不能为空")
    private Integer discountType;

    @Schema(description = "折扣值", requiredMode = Schema.RequiredMode.REQUIRED, example = "20.00")
    @NotNull(message = "折扣值不能为空")
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

    @Schema(description = "状态", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "状态不能为空")
    private Integer status;
}
