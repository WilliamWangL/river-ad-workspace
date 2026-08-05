package com.river.module.tracking.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.*;

import java.time.LocalDateTime;

@TableName("river_tracking_click")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClickDO extends TenantBaseDO {

    @TableId
    private String clickId;

    /** 目标类型: 1=商家, 2=Offer, 3=Deal, 4=优惠券 */
    private Integer targetType;

    /** 目标实体 ID */
    private Long targetId;

    /** 商家 ID（冗余字段，便于统计） */
    private Long merchantId;

    /** 商家名称（冗余字段，便于展示） */
    private String merchantName;

    /** 优惠券 ID（冗余字段，targetType=4 时填充） */
    private Long couponId;

    /** Deal ID（冗余字段，targetType=3 时填充） */
    private Long dealId;

    /** 实际跳转使用的 gotoUrl */
    private String gotoUrl;

    /** 活动 ID */
    private Long campaignId;

    /** 落地页 ID */
    private Long landingPageId;

    /** Sub ID 1 */
    private String sub1;

    /** Sub ID 2 */
    private String sub2;

    /** Sub ID 3 */
    private String sub3;

    /** Sub ID 4 */
    private String sub4;

    /** Sub ID 5 */
    private String sub5;

    /** IP 地址 */
    private String ip;

    /** User Agent */
    private String userAgent;

    /** 来源页 */
    private String referer;

    /** 设备类型 */
    private String deviceType;

    /** 国家 */
    private String country;

    /** 点击时间 */
    private LocalDateTime clickTime;
}
