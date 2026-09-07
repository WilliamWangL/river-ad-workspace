package com.river.module.system.dal.dataobject.oauth2;

import com.river.framework.common.enums.UserTypeEnum;
import com.river.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * OAuth2 刷新令牌
 *
 * @author 芋道源码
 */
@TableName(value = "system_oauth2_refresh_token", autoResultMap = true)
// 由于 Oracle 的 SEQ 的名字长度有限制，所以就先用 system_oauth2_access_token_seq 吧，反正也没啥问题
@Data
public class OAuth2RefreshTokenDO extends TenantBaseDO {

    /**
     * 编号，数据库字典
     */
    private Long id;
    /**
     * 刷新令牌
     */
    private String refreshToken;
    /**
     * 用户编号
     */
    private Long userId;
    /**
     * 用户类型
     *
     * 枚举 {@link UserTypeEnum}
     */
    private Integer userType;
    /**
     * 客户端编号
     *
     * 关联 {@link OAuth2ClientDO#getId()}
     */
    private String clientId;
    /**
     * 授权范围
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> scopes;
    /**
     * 过期时间
     */
    private LocalDateTime expiresTime;

}
