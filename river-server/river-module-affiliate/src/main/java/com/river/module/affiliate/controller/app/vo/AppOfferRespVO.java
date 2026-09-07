package com.river.module.affiliate.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Schema(description = "用户 App - Offer Response VO")
@Data
public class AppOfferRespVO {

    @Schema(description = "Offer 编号", requiredMode = Schema.RequiredMode.REQUIRED, example = "1024")
    private Long id;

    @Schema(description = "商家 ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "100")
    private Long merchantId;

    @Schema(description = "Offer 名称", requiredMode = Schema.RequiredMode.REQUIRED, example = "Amazon Shopping")
    private String name;

    @Schema(description = "Offer 描述", example = "Shop and earn cashback")
    private String description;

    @Schema(description = "佣金类型", example = "1")
    private Integer commissionType;

    @Schema(description = "佣金数值", example = "5.00")
    private BigDecimal commissionValue;

    @Schema(description = "佣金货币", example = "USD")
    private String currency;

    @Schema(description = "支持地区", example = "[\"US\", \"UK\"]")
    private List<String> regions;

    @Schema(description = "跳转链接", example = "https://www.amazon.com/dp/B0123456")
    private String gotoUrl;

}
