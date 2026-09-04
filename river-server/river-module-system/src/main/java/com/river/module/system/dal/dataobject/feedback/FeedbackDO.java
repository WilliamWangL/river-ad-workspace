package com.river.module.system.dal.dataobject.feedback;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.*;

/**
 * 用户意见/反馈 DO
 */
@TableName("river_system_feedback")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDO extends TenantBaseDO {

    @TableId
    private Long id;

    /**
     * 反馈来源类型：deal / blog / offer / general
     */
    private String sourceType;

    /** 来源页面标识（如 slug 或 URL） */
    private String sourcePage;

    /** 提交人姓名 */
    private String name;

    /** 邮箱（选填） */
    private String email;

    /** 反馈内容 */
    private String message;

    /**
     * 处理状态
     * 0 - 待处理
     * 1 - 已处理
     */
    private Integer status;

    /** 处理备注 */
    private String remark;
}
