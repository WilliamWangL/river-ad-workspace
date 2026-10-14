package com.river.module.coupon.dal.dataobject;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.river.framework.tenant.core.db.TenantBaseDO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Deal 分类关联 DO（river_coupon_deal_category 表）
 *
 * 通过 (deal_id, category_id) 关联行支撑按分类筛选 Deal，
 * 替代对 category_ids 逗号串做 FIND_IN_SET 的全表扫描。
 */
@TableName("river_coupon_deal_category")
@Data
@EqualsAndHashCode(callSuper = true)
@ToString(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DealCategoryDO extends TenantBaseDO {

    @TableId
    private Long id;

    /** Deal ID */
    private Long dealId;

    /** 分类 ID */
    private Long categoryId;

}
