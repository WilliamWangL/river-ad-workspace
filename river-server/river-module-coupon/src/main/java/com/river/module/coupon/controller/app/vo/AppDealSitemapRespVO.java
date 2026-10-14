package com.river.module.coupon.controller.app.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "用户 App - Deal Sitemap Response VO（轻量，仅含生成 sitemap 所需字段）")
@Data
public class AppDealSitemapRespVO {

    @Schema(description = "Deal编号", requiredMode = Schema.RequiredMode.REQUIRED, example = "1024")
    private Long id;

    @Schema(description = "URL友好标识", requiredMode = Schema.RequiredMode.REQUIRED, example = "50-off-everything")
    private String slug;

    @Schema(description = "更新时间", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDateTime updateTime;

}
