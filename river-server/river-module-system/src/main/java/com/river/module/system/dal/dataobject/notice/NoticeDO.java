package com.river.module.system.dal.dataobject.notice;

import com.river.framework.common.enums.CommonStatusEnum;
import com.river.framework.mybatis.core.dataobject.BaseDO;
import com.river.module.system.enums.notice.NoticeTypeEnum;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 通知公告表
 *
 * @author ruoyi
 */
@TableName("system_notice")
@Data
@EqualsAndHashCode(callSuper = true)
public class NoticeDO extends BaseDO {

    /**
     * 公告ID
     */
    private Long id;
    /**
     * 公告标题
     */
    private String title;
    /**
     * 公告类型
     *
     * 枚举 {@link NoticeTypeEnum}
     */
    private Integer type;
    /**
     * 公告内容
     */
    private String content;
    /**
     * 公告状态
     *
     * 枚举 {@link CommonStatusEnum}
     */
    private Integer status;

}
