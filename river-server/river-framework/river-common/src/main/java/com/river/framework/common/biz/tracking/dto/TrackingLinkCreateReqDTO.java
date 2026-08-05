package com.river.framework.common.biz.tracking.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 追踪链接创建请求 DTO
 */
@Schema(description = "管理后台 - 追踪链接创建请求")
@Data
public class TrackingLinkCreateReqDTO {

    @Schema(description = "目标类型: 1=商家, 2=Offer, 3=Deal, 4=优惠券", requiredMode = Schema.RequiredMode.REQUIRED, example = "2")
    @NotNull(message = "目标类型不能为空")
    private Integer targetType;

    @Schema(description = "目标实体 ID", requiredMode = Schema.RequiredMode.REQUIRED, example = "1")
    @NotNull(message = "目标 ID 不能为空")
    private Long targetId;

    @Schema(description = "商家 ID（冗余字段，便于点击记录填充）", example = "1")
    private Long merchantId;

    @Schema(description = "短链接标识", example = "offer-1")
    private String slug;

    @Schema(description = "追加参数后的完整追踪链接", requiredMode = Schema.RequiredMode.REQUIRED)
    @NotNull(message = "追踪链接不能为空")
    private String trackingUrl;

}
