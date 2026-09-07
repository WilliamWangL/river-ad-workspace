package com.river.module.infra.dal.dataobject.db;

import com.river.framework.mybatis.core.dataobject.BaseDO;
import com.river.framework.mybatis.core.type.EncryptTypeHandler;
import com.river.framework.tenant.core.aop.TenantIgnore;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

/**
 * 数据源配置
 *
 * @author 芋道源码
 */
@TableName(value = "infra_data_source_config", autoResultMap = true)
@Data
@TenantIgnore
public class DataSourceConfigDO extends BaseDO {

    /**
     * 主键编号 - Master 数据源
     */
    public static final Long ID_MASTER = 0L;

    /**
     * 主键编号
     */
    private Long id;
    /**
     * 连接名
     */
    private String name;

    /**
     * 数据源连接
     */
    private String url;
    /**
     * 用户名
     */
    private String username;
    /**
     * 密码
     */
    @TableField(typeHandler = EncryptTypeHandler.class)
    private String password;

}
