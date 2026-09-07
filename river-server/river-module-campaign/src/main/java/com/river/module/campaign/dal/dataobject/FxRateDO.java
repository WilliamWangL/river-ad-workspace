package com.river.module.campaign.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@TableName("river_campaign_fx_rate")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FxRateDO extends TenantBaseDO {

    @TableId
    private Long id;

    private String fromCurrency;

    private String toCurrency;

    private BigDecimal rate;

    private LocalDate effectiveDate;
}
