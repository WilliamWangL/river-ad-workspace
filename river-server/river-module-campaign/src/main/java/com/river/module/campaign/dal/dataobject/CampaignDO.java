package com.river.module.campaign.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.*;

import java.math.BigDecimal;

@TableName("river_campaign_campaign")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CampaignDO extends TenantBaseDO {

    @TableId
    private Long id;

    private Long trafficSourceId;

    private String name;

    private Integer type;

    private String offerIds;

    private Long landingPageId;

    private BigDecimal budgetDaily;

    private BigDecimal budgetTotal;

    private String externalCampaignId;

    private Integer status;
}
