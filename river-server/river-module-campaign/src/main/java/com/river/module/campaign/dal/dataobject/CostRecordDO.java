package com.river.module.campaign.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@TableName("river_campaign_cost_record")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CostRecordDO extends TenantBaseDO {

    @TableId
    private Long id;

    private Long campaignId;

    private Long adGroupId;

    private LocalDate date;

    private Integer impressions;

    private Integer clicks;

    private BigDecimal cost;

    private String currency;

    private Integer source;
}
