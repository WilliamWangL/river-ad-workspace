package com.river.module.tracking.controller.admin.click.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Schema(description = "管理后台 - 点击记录 Response VO")
@Data
public class ClickRespVO {

    @Schema(description = "点击 ID", example = "01HXYZ...")
    private String clickId;

    @Schema(description = "目标类型", example = "2")
    private Integer targetType;

    @Schema(description = "目标 ID", example = "1")
    private Long targetId;

    @Schema(description = "商家 ID", example = "1")
    private Long merchantId;

    @Schema(description = "商家名称", example = "Amazon")
    private String merchantName;

    @Schema(description = "优惠券 ID", example = "1")
    private Long couponId;

    @Schema(description = "Deal ID", example = "1")
    private Long dealId;

    @Schema(description = "实际跳转 URL")
    private String gotoUrl;

    @Schema(description = "Campaign ID", example = "1")
    private Long campaignId;

    @Schema(description = "落地页 ID", example = "1")
    private Long landingPageId;

    @Schema(description = "Sub1 参数")
    private String sub1;

    @Schema(description = "Sub2 参数")
    private String sub2;

    @Schema(description = "Sub3 参数")
    private String sub3;

    @Schema(description = "Sub4 参数")
    private String sub4;

    @Schema(description = "Sub5 参数")
    private String sub5;

    @Schema(description = "IP 地址")
    private String ip;

    @Schema(description = "User Agent")
    private String userAgent;

    @Schema(description = "来源页面")
    private String referer;

    @Schema(description = "设备类型")
    private String deviceType;

    @Schema(description = "国家")
    private String country;

    @Schema(description = "点击时间")
    private LocalDateTime clickTime;

    @Schema(description = "创建时间")
    private LocalDateTime createTime;

}
