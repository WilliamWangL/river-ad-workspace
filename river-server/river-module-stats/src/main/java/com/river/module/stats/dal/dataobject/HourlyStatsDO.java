package com.river.module.stats.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.mybatis.core.dataobject.BaseDO;
import com.river.module.stats.enums.DimensionTypeEnum;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 小时统计 DO
 */
@TableName("river_stats_hourly")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HourlyStatsDO extends BaseDO {

    @TableId
    private Long id;

    /** 小时时间点 */
    private LocalDateTime hour;

    /** 维度类型 {@link DimensionTypeEnum} */
    private Integer dimensionType;

    /** 维度 ID */
    private Long dimensionId;

    /** 点击数 */
    private Integer clicks;

    /** 转化数 */
    private Integer conversions;

    /** 收入 */
    private BigDecimal revenue;

    /** 成本 */
    private BigDecimal cost;

}
