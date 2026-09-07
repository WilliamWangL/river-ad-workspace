package com.river.module.campaign.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.*;

@TableName("river_campaign_ad_group")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdGroupDO extends TenantBaseDO {

    @TableId
    private Long id;

    private Long campaignId;

    private String name;

    private String targeting;

    private String bidStrategy;

    private String externalAdGroupId;

    private Integer status;
}
