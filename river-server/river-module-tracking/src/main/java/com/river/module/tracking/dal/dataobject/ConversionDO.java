package com.river.module.tracking.dal.dataobject;

import com.river.framework.mybatis.core.dataobject.BaseDO;
import com.river.module.tracking.enums.ConversionStatusEnum;
import com.river.module.tracking.enums.ConversionTypeEnum;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@TableName("river_tracking_conversion")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversionDO extends BaseDO {

    @TableId
    private Long id;

    private String clickId;

    private String networkCode;

    private String externalConversionId;

    /** {@link ConversionTypeEnum} */
    private Integer conversionType;

    private BigDecimal commission;

    private String currency;

    /** {@link ConversionStatusEnum} */
    private Integer status;

    private String networkPayload;

    private LocalDateTime conversionTime;

    // ========== 冗余字段（便于统计，与 ClickDO 保持一致）==========

    /** {@link com.river.module.tracking.enums.TrackingTargetTypeEnum} */
    private Integer targetType;

    private Long targetId;

    private Long merchantId;

}
