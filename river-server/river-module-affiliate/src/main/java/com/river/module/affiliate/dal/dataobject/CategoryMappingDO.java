package com.river.module.affiliate.dal.dataobject;

import com.river.framework.tenant.core.db.TenantBaseDO;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.*;

/**
 * 联盟分类映射 DO
 * 用于将各联盟的分类映射到本地统一分类体系
 */
@TableName("river_affiliate_category_mapping")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryMappingDO extends TenantBaseDO {

    @TableId
    private Long id;

    /** 联盟网络 ID */
    private Long networkId;

    /** 联盟原始分类 ID */
    private String externalId;

    /** 联盟原始分类名称 */
    private String externalName;

    /** 联盟父分类 ID */
    private String externalParentId;

    /** 映射的本地分类 ID（可为空，表示未映射） */
    private Long categoryId;

    /** 是否自动创建的映射 */
    private Boolean autoCreated;
}
