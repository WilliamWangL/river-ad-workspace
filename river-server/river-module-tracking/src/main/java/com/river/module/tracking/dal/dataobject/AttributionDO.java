package com.river.module.tracking.dal.dataobject;

import com.river.framework.mybatis.core.dataobject.BaseDO;
import com.river.module.tracking.enums.AttributionTypeEnum;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

@TableName("river_tracking_attribution")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttributionDO extends BaseDO {

    @TableId
    private Long id;

    private Long conversionId;

    private String clickId;

    /** {@link AttributionTypeEnum} */
    private Integer attributionType;

    private Integer confidenceScore;

    private Long attributionWindow;

}
