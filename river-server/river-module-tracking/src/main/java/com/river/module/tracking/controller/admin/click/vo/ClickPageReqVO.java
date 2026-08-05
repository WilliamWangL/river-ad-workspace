package com.river.module.tracking.controller.admin.click.vo;

import com.river.framework.common.pojo.PageParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

import static com.river.framework.common.util.date.DateUtils.FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND;

@Schema(description = "管理后台 - 点击记录分页 Request VO")
@Data
@EqualsAndHashCode(callSuper = true)
public class ClickPageReqVO extends PageParam {

    @Schema(description = "目标类型", example = "2")
    private Integer targetType;

    @Schema(description = "目标 ID")
    private Long targetId;

    @Schema(description = "商家 ID")
    private Long merchantId;

    @Schema(description = "优惠券 ID")
    private Long couponId;

    @Schema(description = "Deal ID")
    private Long dealId;

    @Schema(description = "Campaign ID")
    private Long campaignId;

    @Schema(description = "Sub1 参数")
    private String sub1;

    @Schema(description = "IP 地址")
    private String ip;

    @Schema(description = "国家")
    private String country;

    @Schema(description = "点击时间")
    @DateTimeFormat(pattern = FORMAT_YEAR_MONTH_DAY_HOUR_MINUTE_SECOND)
    private LocalDateTime[] clickTime;

}
