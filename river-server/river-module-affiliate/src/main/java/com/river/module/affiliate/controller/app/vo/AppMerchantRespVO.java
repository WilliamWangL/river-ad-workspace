package com.river.module.affiliate.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "用户 App - 商家 Response VO")
@Data
public class AppMerchantRespVO {

    @Schema(description = "商家编号", requiredMode = Schema.RequiredMode.REQUIRED, example = "1024")
    private Long id;

    @Schema(description = "商家名称", requiredMode = Schema.RequiredMode.REQUIRED, example = "Amazon")
    private String name;

    @Schema(description = "URL友好标识", requiredMode = Schema.RequiredMode.REQUIRED, example = "amazon")
    private String slug;

    @Schema(description = "商家域名", example = "amazon.com")
    private String domain;

    @Schema(description = "Logo URL", example = "https://example.com/logo.png")
    private String logoUrl;

    @Schema(description = "商家描述（联盟同步原始描述，回退值）", example = "Everything store")
    private String description;

    @Schema(description = "商家简介（短文本，为空回退 description）", example = "Up to 40% off electronics")
    private String intro;

    @Schema(description = "商家描述（长富文本，为空回退 description）")
    private String about;

    @Schema(description = "评分", example = "4.5")
    private BigDecimal rating;

    @Schema(description = "支持地区", example = "[\"US\", \"UK\"]")
    private List<String> regions;

    @Schema(description = "Deal 数量", example = "120")
    private Integer dealCount;

    @Schema(description = "优惠券数量", example = "50")
    private Integer couponCount;

}
