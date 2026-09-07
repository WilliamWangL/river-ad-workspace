package com.river.module.system.dal.dataobject.sms;

import com.river.framework.mybatis.core.dataobject.BaseDO;
import com.river.framework.tenant.core.aop.TenantIgnore;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 手机验证码 DO
 *
 * idx_mobile 索引：基于 {@link #mobile} 字段
 *
 * @author 芋道源码
 */
@TableName("system_sms_code")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TenantIgnore
public class SmsCodeDO extends BaseDO {

    /**
     * 编号
     */
    private Long id;
    /**
     * 手机号
     */
    private String mobile;
    /**
     * 验证码
     */
    private String code;
    /**
     * 发送场景
     *
     * 枚举 {@link SmsCodeDO}
     */
    private Integer scene;
    /**
     * 创建 IP
     */
    private String createIp;
    /**
     * 今日发送的第几条
     */
    private Integer todayIndex;
    /**
     * 是否使用
     */
    private Boolean used;
    /**
     * 使用时间
     */
    private LocalDateTime usedTime;
    /**
     * 使用 IP
     */
    private String usedIp;

}
