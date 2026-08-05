package com.river.module.tracking.controller.admin.trackinglink.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Schema(description = "管理后台 - 追踪链接创建/修改 Request VO")
@Data
public class TrackingLinkSaveReqVO {

    @Schema(description = "编号", example = "1")
    private Long id;

    @Schema(description = "目标类型", requiredMode = Schema.RequiredMode.REQUIRED, example = "2")
    @NotNull(message = "目标类型不能为空")
    private Integer targetType;

    @Schema(description = "目标 ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "目标 ID 不能为空")
    private Long targetId;

    @Schema(description = "商家 ID（冗余字段）", example = "1")
    private Long merchantId;

    @Schema(description = "链接 Slug", requiredMode = Schema.RequiredMode.REQUIRED, example = "my-link")
    @NotBlank(message = "链接 Slug 不能为空")
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

    @Schema(description = "状态", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "状态不能为空")
    private Integer status;

}
