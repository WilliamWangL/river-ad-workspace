package com.river.module.tracking.dal.dataobject;

import com.river.framework.mybatis.core.dataobject.BaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@TableName("river_tracking_unattributed_conversion")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnattributedConversionDO extends BaseDO {

    @TableId
    private Long id;

    private String networkCode;

    private String externalConversionId;

    private Integer conversionType;

    private BigDecimal commission;

    private String currency;

    private String networkPayload;

    private String rawRequest;

    private String attributionFailReason;

    private LocalDateTime conversionTime;

}
