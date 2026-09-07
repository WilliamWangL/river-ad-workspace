package com.river.module.affiliate.dal.dataobject;

import com.river.framework.tenant.core.db.TenantBaseDO;
import com.river.module.affiliate.enums.NetworkStatusEnum;
import com.river.module.affiliate.enums.NetworkTypeEnum;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 联盟网络 DO
 */
@TableName("river_affiliate_network")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AffiliateNetworkDO extends TenantBaseDO {

    @TableId
    private Long id;

    /** 联盟编码（唯一标识）如：admitad, cj, awin */
    private String code;

    /** 联盟名称 */
    private String name;

    /** 联盟类型 {@link NetworkTypeEnum} */
    private Integer type;

    /** API 基础地址 */
    private String apiBaseUrl;

    /** 状态 {@link NetworkStatusEnum} */
    private Integer status;

    /** 联盟官网 */
    private String websiteUrl;

    /** Logo URL */
    private String logoUrl;

    /** 描述 */
    private String description;

    /** 备注 */
    private String remark;
}
