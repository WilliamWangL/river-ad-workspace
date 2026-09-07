package com.river.module.tracking.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.*;

@TableName("river_tracking_link")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrackingLinkDO extends TenantBaseDO {

    @TableId
    private Long id;

    /** 目标类型: 1=商家, 2=Offer, 3=Deal, 4=优惠券 */
    private Integer targetType;

    /** 目标实体 ID */
    private Long targetId;

    /** 商家 ID（冗余字段，便于点击记录填充） */
    private Long merchantId;

    /** 短链接标识 */
    private String slug;

    /** 追加参数后的完整追踪链接 */
    private String trackingUrl;

    /** 预设 Sub1 */
    private String presetSub1;

    /** 预设 Sub2 */
    private String presetSub2;

    /** 预设 Sub3 */
    private String presetSub3;

    /** 预设 Sub4 */
    private String presetSub4;

    /** 预设 Sub5 */
    private String presetSub5;

    /** UTM 参数 */
    private String utmParams;

    /** 状态: 1=禁用, 0=启用 */
    private Integer status;
}
