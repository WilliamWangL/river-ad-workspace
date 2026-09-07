package com.river.module.stats.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.mybatis.core.dataobject.BaseDO;
import com.river.module.stats.enums.DimensionTypeEnum;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 日报统计 DO
 */
@TableName("river_stats_daily")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyStatsDO extends BaseDO {

    @TableId
    private Long id;

    /** 统计日期 */
    private LocalDate date;

    /** 维度类型 {@link DimensionTypeEnum} */
    private Integer dimensionType;

    /** 维度 ID */
    private Long dimensionId;

    /** 原始 Offer ID（用于筛选） */
    private Long offerId;

    /** 原始 Campaign ID（用于筛选） */
    private Long campaignId;

    /** 原始流量来源 ID（用于筛选） */
    private Long trafficSourceId;

    /** 点击数 */
    private Integer clicks;

    /** 转化数 */
    private Integer conversions;

    /** 收入 */
    private BigDecimal revenue;

    /** 成本 */
    private BigDecimal cost;

    /** 利润 */
    private BigDecimal profit;

    /** 每次点击收益 */
    private BigDecimal epc;

    /** 转化率 */
    private BigDecimal cr;

    /** 投资回报率 */
    private BigDecimal roi;

}
