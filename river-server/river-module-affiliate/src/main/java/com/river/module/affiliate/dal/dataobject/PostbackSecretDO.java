package com.river.module.affiliate.dal.dataobject;

import com.river.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * Postback 回调验证配置 DO
 */
@TableName("river_affiliate_postback_secret")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostbackSecretDO extends TenantBaseDO {

    @TableId
    private Long id;

    /** 关联的联盟网络 ID */
    private Long networkId;

    /** 签名密钥 */
    private String secretKey;

    /** 签名算法，如：HMAC-SHA256 */
    private String algorithm;

    /** 允许的 IP 白名单（JSON 数组） */
    private String allowedIps;

    /** 是否启用 IP 白名单 */
    private Boolean ipWhitelistEnabled;

    /** 是否启用签名验证 */
    private Boolean signatureEnabled;
}
