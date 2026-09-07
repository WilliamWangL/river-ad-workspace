package com.river.module.affiliate.dal.dataobject;

import com.river.framework.tenant.core.db.TenantBaseDO;
import com.river.module.affiliate.enums.AuthTypeEnum;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 联盟网络凭证 DO
 */
@TableName("river_affiliate_network_credential")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NetworkCredentialDO extends TenantBaseDO {

    @TableId
    private Long id;

    /** 关联的联盟网络 ID */
    private Long networkId;

    /** 认证类型 {@link AuthTypeEnum} */
    private Integer authType;

    /** 凭证数据（JSON 加密存储） */
    private String credentials;

    /** Token 过期时间 */
    private LocalDateTime expiresAt;

    /** 是否启用 */
    private Boolean enabled;
}
