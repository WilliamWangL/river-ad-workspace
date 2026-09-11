package com.river.module.coupon.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Schema(description = "用户 App - Deal商家信息 Response VO")
@Data
public class AppDealMerchantRespVO {

    @Schema(description = "商家编号", requiredMode = Schema.RequiredMode.REQUIRED, example = "1024")
    private Long id;

    @Schema(description = "商家名称", requiredMode = Schema.RequiredMode.REQUIRED, example = "Amazon")
    private String name;

    @Schema(description = "URL友好标识", requiredMode = Schema.RequiredMode.REQUIRED, example = "amazon")
    private String slug;

    @Schema(description = "Logo URL", example = "https://example.com/logo.png")
    private String logoUrl;

    @Schema(description = "货币代码（ISO 4217）", example = "USD")
    private String currency;

}
