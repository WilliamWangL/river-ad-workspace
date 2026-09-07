package com.river.framework.common.biz.tracking.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 追踪链接响应 DTO
 */
@Schema(description = "管理后台 - 追踪链接响应")
@Data
public class TrackingLinkRespDTO {

    @Schema(description = "链接 ID", example = "1")
    private Long id;

    @Schema(description = "目标类型: 1=商家, 2=Offer, 3=Deal, 4=优惠券", example = "2")
    private Integer targetType;

    @Schema(description = "目标实体 ID", example = "1")
    private Long targetId;

    @Schema(description = "商家 ID（冗余字段）", example = "1")
    private Long merchantId;

    @Schema(description = "短链接标识", example = "offer-1")
    private String slug;

    @Schema(description = "追加参数后的完整追踪链接")
    private String trackingUrl;

    @Schema(description = "状态: 0=禁用, 1=启用", example = "1")
    private Integer status;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

}
