package com.river.module.tracking.controller.admin.trackinglink.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 追踪链接 Response VO")
@Data
public class TrackingLinkRespVO {

    @Schema(description = "编号", example = "1")
    private Long id;

    @Schema(description = "目标类型", example = "2")
    private Integer targetType;

    @Schema(description = "目标 ID", example = "1")
    private Long targetId;

    @Schema(description = "商家 ID（冗余字段）", example = "1")
    private Long merchantId;

    @Schema(description = "链接 Slug", example = "my-link")
    private String slug;

    @Schema(description = "预设 Sub1")
    private String presetSub1;

    @Schema(description = "预设 Sub2")
    private String presetSub2;

    @Schema(description = "预设 Sub3")
    private String presetSub3;

    @Schema(description = "预设 Sub4")
    private String presetSub4;

    @Schema(description = "预设 Sub5")
    private String presetSub5;

    @Schema(description = "UTM 参数")
    private String utmParams;

    @Schema(description = "状态", example = "1")
    private Integer status;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

}
